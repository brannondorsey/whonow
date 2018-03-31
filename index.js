const fs     = require('fs')
const path   = require('path')
const dns    = require('native-dns')
const log    = require('loglevel')
const c      = require('chalk')
const { ArgumentParser } = require('argparse')

const Client = require('./src/Client.js')
const server = dns.createServer()

function main() {

    const args = parseArgs()
    log.setDefaultLevel('info')
    log.setLevel('debug')

    const clients = {}

    server.on('request', (request, response) => {
      
        request.question.forEach(question => {

            const domain = question.name
            log.debug(question)
            
            if (!clients.hasOwnProperty[domain]) {
                clients[domain] = new Client(domain)
            }

            const address = clients[domain].next()

            let answer = {
                name: domain,
                address: address || args['default_answer'],
                ttl: 1,
            }

            // only handle A and CNAME for now
            switch(question.type) {
              
                case dns.consts.NAME_TO_QTYPE.A:
                    response.answer.push(dns.A(answer))
                    break

                default:
                    console.log('in here')
            }
        })

        response.send()
    })

    server.on('listening', () => {
        log.info(c.gray('[*]') + ` server listening on port ${args.port}`)
    })

    server.on('error', (err, buff, req, res) => {
        console.log(err.stack)
    })

    server.on('socketError', (err, socket) => {
        if (err.code == 'EACCES') {
            let m = c.red(`[!]`)
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
        help: 'what port to run the dns server on (default: 53).',
        defaultValue: 53
      }
    )

    parser.addArgument(
      [ '-d', '--default-answer' ],
      {
        help: 'default IP address to respond with if not rule is found (default: "127.0.0.1").',
        defaultValue: '127.0.0.1'
      }
    )

    return parser.parseArgs()
}

main()
