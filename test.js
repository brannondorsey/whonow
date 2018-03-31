const dns = require('dns')
const assert = require('assert')
const uuidv4 = require('uuid/v4')

const { spawn } = require('child_process');
const dnsliar = spawn('node', ['index.js', '--help', 15354])

let running = false
dnsliar.stdout.on('data', (data) => {
  	console.log(`stdout: ${data}`)
  	if (!running) {
		resolveRequests(requests)
		running = true
  	}
})

dnsliar.stderr.on('data', (data) => {
  	console.log(`stderr: ${data}`);
})

dnsliar.on('close', (code) => {
  	console.log(`child process exited with code ${code}`)
})

const uuid = uuidv4()

const requests = [
	// domain name, expected result
	[`rebind.network`, '127.0.0.1'],
	[`A.192.168.1.1.${uuid}.rebind.network`, '127.0.0.1'],

	[`A.192.168.1.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.1time.${uuid}.rebind.network`, '127.0.0.1'],

	[`A.192.168.1.1.forever.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.forever.${uuid}.rebind.network`, '192.168.1.1'],

	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '10.0.0.1'],
	[`A.192.168.1.1.5times.10.0.0.1.1time.${uuid}.rebind.network`, '127.0.0.1'],

	[`A.192.168.1.1.1time.192.168.1.2.1times.repeat.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.1time.192.168.1.2.1times.repeat.${uuid}.rebind.network`, '192.168.1.2'],
	[`A.192.168.1.1.1time.192.168.1.2.1times.repeat.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.1time.192.168.1.2.1times.repeat.${uuid}.rebind.network`, '192.168.1.2'],

	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.1'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.2'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.2'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3'],
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3']
]

dns.setServers(['127.0.0.1:15354'])

function resolveRequests(requests, index=0) {
	if (index < requests.length) {
		dns.resolve(requests[index][0], 'A', (err, result) => {
			if (err) throw err
			console.log(`${result.toString().padEnd(15)} ${requests[index][0]}`)
			assert.equal(result, requests[index][1])
			resolveRequests(requests, index + 1)
		})
	}
}
