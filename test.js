const dns = require('dns')
const assert = require('assert')
const uuidv4 = require('uuid/v4')

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
	[`A.192.168.1.1.1time.192.168.1.2.2times.192.168.1.3.forever.${uuid}.rebind.network`, '192.168.1.3'],

	[`a.127.0.0.1.1time.192.168.1.0.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.1.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.2.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.3.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.4.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.5.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.6.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.7.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.8.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.9.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.10.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.11.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.12.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.13.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.14.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.15.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.16.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.17.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.18.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.19.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.20.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.21.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.22.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.23.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.24.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.25.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.26.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.27.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.28.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.29.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.30.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.31.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.32.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.33.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.34.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.35.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.36.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.37.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.38.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.39.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.40.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.41.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.42.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.43.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.44.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.45.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.46.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.47.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.48.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.49.forever.${uuid}.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.50.forever.${uuid}.rebind.network`, `127.0.0.1`]

]

dns.setServers(['127.0.0.1:15353'])

resolveRequests(requests)

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
