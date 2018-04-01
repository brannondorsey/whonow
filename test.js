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

	[`a.127.0.0.1.1time.192.168.1.12.forever.6c1bc3e8-b7c3-4481-93d6-9fbabd56bd5e.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.0.forever.3c06c352-ad4c-4672-af16-4ef64fe71b4f.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.1.forever.4e7404d9-fd58-4fa8-b61f-25ac6c39a096.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.2.forever.f54662f9-56b9-4904-bf27-337c09cfe355.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.3.forever.28735544-054b-45e9-84b7-669a2d20b8c1.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.5.forever.51cd069e-f70f-4671-817a-f9cd33c4597d.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.4.forever.e57531ce-d7be-45ad-83dd-5675f37c24a3.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.6.forever.dd71150e-e07b-4ba6-9443-3cbf39605eb9.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.8.forever.34e38188-cbf0-4846-aacf-4cbdce220af8.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.7.forever.b19092f1-22b7-498a-bdff-a11b7334c1e4.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.9.forever.3cfda374-e4df-4f44-a968-9bde5cf6c259.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.10.forever.8c5ccb4b-032b-4352-8908-b566d45bff99.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.12.forever.b2792821-5518-4c62-94af-0e5ebac6bdcc.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.11.forever.12587a24-7eb1-488c-bc3d-663e31364474.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.13.forever.a1f9f1ed-8f01-404b-b11a-b585096c7f85.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.14.forever.8a7a04f0-d785-41c6-936c-90796b6eeb42.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.15.forever.b6f150f5-6769-4538-bd70-99b713fbbb5c.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.16.forever.9d3ab707-a6bb-48db-a566-b9053726ae0b.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.17.forever.b2e592a2-c436-4051-930b-c2eab7a19a31.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.18.forever.866925a5-b610-4472-8c7c-0f2678c7fcdb.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.19.forever.2e21e90c-46ea-422b-a98c-8be49719b514.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.20.forever.57a32862-49e7-4a2b-9c25-de7048ffbcd5.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.21.forever.754b73df-aa0a-48fe-a1f8-e59992784dd5.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.22.forever.87c39823-9175-4d60-9abf-306a7187c071.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.25.forever.94db9131-9661-4d7d-b976-1a8d76ccfd1a.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.23.forever.bdef5cfa-b7d5-4165-bbbd-77bba9b872e7.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.24.forever.e2647120-78c9-4da9-8b9f-b941c2e47ddc.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.26.forever.887c0eae-85f6-469c-bfe9-b9af1bf9237d.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.27.forever.2438e160-4fc6-42a0-bc32-4ef6df30f43e.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.28.forever.93085063-4d4a-49fc-a740-dcf32cb6c270.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.29.forever.98f70468-ccf7-4cc4-9cf6-171117d72f79.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.30.forever.79cf8fb8-f8b8-4d71-a0c1-ee458f309628.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.31.forever.50ef101b-bdb1-4077-b0ab-ca9457f33879.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.32.forever.46f55c86-583b-4528-b304-1c66e13b9de4.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.33.forever.f439a2a6-8c40-432d-8bce-e000bc3e65d7.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.34.forever.148b9ba2-2895-4ff7-9fb9-cbec8b65789e.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.35.forever.392e8208-ad1b-49a0-a1da-c3399c6c8eec.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.36.forever.a0527289-dab2-49b9-8413-f0dc1509add8.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.37.forever.e1446ca6-0ed9-4be9-ba6e-964b96ea76a2.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.38.forever.de2d0fd8-e1d7-4c99-885b-8d78e1f32ba7.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.39.forever.4a46671a-4b23-4878-b4bf-122aa4105a85.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.40.forever.32a402e1-71c5-4ca8-befb-4469fbce5bbc.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.41.forever.2d076588-0e8c-4ab2-b06f-880e090973fc.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.42.forever.9fe48056-3311-4c20-a2f8-6090302539ea.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.43.forever.2244af27-80ae-450c-8744-1f64e3a3eeb4.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.44.forever.079526fe-158d-40c5-92c9-b85f54ab9641.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.45.forever.425e2c33-7551-4f1a-999a-3c154b6b41d7.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.47.forever.48d1af4d-bcab-4950-a322-2f20adc18c11.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.46.forever.2c0b5dbf-e189-45c1-8a27-16183cc1039e.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.48.forever.0b10b9e5-e14e-4959-b564-9c36aa1c5763.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.49.forever.8c7885df-75bf-4810-97eb-1fa2e2e12a79.rebind.network`, `127.0.0.1`],
	[`a.127.0.0.1.1time.192.168.1.50.forever.59302ac9-3a69-4991-84bb-6d2de6aa3fd0.rebind.network`, `127.0.0.1`]

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
