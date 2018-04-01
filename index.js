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
    log.setLevel('debug')

    const domains = {}
    const orderedDomains = new Set()

    server.on('request', (request, response) => {
      
        request.question.forEach(question => {

            const domain = question.name
            
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
                name: domain,
                address: address || args['default_answer'],
                ttl: 1
            }

            // only handle A for now
            switch(question.type) {
                case dns.consts.NAME_TO_QTYPE.A:
                    response.answer.push(dns.A(answer))
                    break
            }
        })

        if (response.answer.length > 0) {
            response.answer.forEach(ans => {
                log.info(c.blue('[+]') + ` A ${c.cyan(ans.address.padEnd(15))} ${ans.name}`)
            })
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
      [ '-p', '--port' ],
      {
        help: 'What port to run the DNS server on (default: 53).',
        defaultValue: 53
      }
    )

    parser.addArgument(
      [ '-d', '--default-answer' ],
      {
        help: 'The default IP address to respond with if no rule is found (default: "127.0.0.1").',
        defaultValue: '127.0.0.1'
      }
    )

    let message =  'The number of domain name records to store in RAM at once. '
        message += 'Once the number of unique domain names queried surpasses this number '
        message += 'domains will be removed from memory in the order they were '
        message += 'requested. Domains that have been removed in this way will '
        message += 'have their program state reset the next time they are queried '
        message += '(default: 10000000).'
    parser.addArgument(
      [ '-b', '--max-ram-domains' ],
      {
        help: message,
        defaultValue: 10000000
      }
    )

    return parser.parseArgs()
}

main()
