#! /usr/bin/env node

const fs     = require('fs')
const path   = require('path')
const dns    = require('native-dns')
const log    = require('loglevel')
const c      = require('chalk')
const { ArgumentParser } = require('argparse')

const DomainRebind = require('./src/DomainRebind.js')
const server = dns.createServer()

function main() {

    const args = parseArgs()
    log.setDefaultLevel('info')

    if (args.logfile) {
        try {
            fs.writeFileSync(args.logfile, 'timestamp,src_ip,question_type,question,answer\n')
            log.info(c.gray('[*]') + ` logging CSV data to ${args.logfile}`)
        } catch (err) {
            log.error(c.red('[!]') + ` error writing to --logfile ${args.logfile}:`)
            log.error(err)
            log.error(c.red('[!]') + ' exiting.')
            process.exit(1)
        }
    }

    const domains = {}
    const orderedDomains = new Set()

    server.on('request', (request, response) => {

        request.question.forEach(question => {

            // only handle A queries for now
            if (question.type == dns.consts.NAME_TO_QTYPE.A) {

                const domain = question.name.toLowerCase()

                if (!domains.hasOwnProperty(domain)) {
                    domains[domain] = new DomainRebind(domain)
                    orderedDomains.add(domain)
                    if (orderedDomains.size > args['max_client_records']) {
                        // remove the oldest client from the set and dict
                        const oldest = orderedDomains.values().next().value
                        orderedDomains.delete(oldest)
                        delete domains[oldest]
                    }
                }

                const address = domains[domain].next()

                let answer = {
                    name: question.name, // respond with original name
                    address: address || args['default_answer'],
                    ttl: args.ttl
                }

                response.answer.push(dns.A(answer))
            }
        })

        if (response.answer.length > 0) {
            response.answer.forEach(ans => {

                const src = `${request.address.address}:${request.address.port}`

                if (args.logfile) {

                    // 'timestamp,src_ip,question_type,question,answer'
                    let line = Date.now() + ','
                    line += src + ','
                    line += 'A,'
                    line += ans.name + ','
                    line += ans.address + '\n'

                    // WARNING: because these calls are async, requests may be
                    // logged out of order. This shouldn't be a problem though
                    // as the csv can be sorted by timestamp
                    fs.appendFile(args.logfile, line, (err) => {
                        if (err) {
                            log.error(c.red('[!]') + ` error writing to ${args.logfile}`)
                            log.error(err)
                        }
                    })
                }

                if (args.verbose) {
                    // time in ISO date format string
                    // https://docs.microsoft.com/en-us/scripting/javascript/date-and-time-strings-javascript#iso-date-format
                    const time = c.yellow(new Date().toISOString())
                    const answer = c.cyan(ans.address.padEnd(15))
                    const address = c.magenta(src.padEnd(21))
                    log.info(c.blue('[+]') + ` ${time} ${address} A ${answer} ${ans.name}`)
                } else {
                    log.info(c.blue('[+]') + ` A ${c.cyan(ans.address.padEnd(15))} ${ans.name}`)
                }
            })
        } else {
            // silently responding to non-A requests with an empty response packet
            // could print here for debugging
        }

        response.send()
    })

    server.on('listening', () => {
        log.info(c.gray('[*]') + ` server listening on port ${args.port}`)
    })

    server.on('error', (err, buff, req, res) => {
        log.error(c.red('[!]') + ' native-dns server error:')
        log.error(err.stack)
    })

    server.on('socketError', (err, socket) => {
        if (err.code == 'EACCES') {
            let m = c.red('[!]')
            m += ` Fatal error binding to port ${args.port}, address in use.`
            log.error(m)
        }
    })

    server.serve(args.port)
}

function parseArgs() {

    const package = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))
    const parser = new ArgumentParser({
        prog: package.name,
            version: package.version,
            description: package.description
    })

    parser.addArgument(
        ['-p', '--port'], {
            help: 'What port to run the DNS server on (default: 53).',
            defaultValue: 53
        }
    )

    parser.addArgument(
        ['-d', '--default-answer'], {
            help: 'The default IP address to respond with if no rule is found (default: "127.0.0.1").',
            defaultValue: '127.0.0.1'
        }
    )

let message = 'The number of domain name records to store in RAM at once. '
message += 'Once the number of unique domain names queried surpasses this number '
message += 'domains will be removed from memory in the order they were '
message += 'requested. Domains that have been removed in this way will '
message += 'have their program state reset the next time they are queried '
message += '(default: 10000000).'
    parser.addArgument(
        ['-b', '--max-ram-domains'], {
            help: message,
            defaultValue: 10000000
        }
    )
    parser.addArgument(
        [ '-l', '--logfile' ],
        {
            help: 'Log to CSV file (default: false)'
        }
    )
    parser.addArgument(
        [ '-m', '--verbose' ],
        {
            help: 'Log request timestamp and sender IP address to stdout (default: false)',
            action: 'storeTrue'
        }
    )
    parser.addArgument(
        ['-t', '--ttl'], {
            help: 'Set the TTL (in seconds) for each DNS reply (default: 1)',
            defaultValue: 1
        }
    )
    return parser.parseArgs()
}

main()
