const dns       = require('dns')
const dnsliar   = require('./index')
const Client    = require('./src/Client')

const domains = [
	'rebind.network',
	'A.192.168.1.1.rebind.network',
	'A.192.168.1.1.1time.rebind.network',
	'A.192.168.1.1.5times.10.0.0.1.1time.rebind.network'
]

domains.forEach(domain => {
	let client = new Client(domain)
	while (true) {
		let ip = client.next()
		console.log(domain)
		console.log(ip)
		if (!ip) break
	} 
})
