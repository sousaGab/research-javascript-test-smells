it('can destroy the socket if stream is not finished', async () => {
  const scope = nock('http://example.test')

  scope
    .intercept('/somepath', 'GET')
    .reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

  const req = http.get('http://example.test/somepath')

  const stream = await new Promise(resolve => req.on('response', resolve))

  let dataEventsCount = 0
  let closeEmitted = false
  let endEmitted = false

  // close after first chunk of data
  stream.on('data', () => {
    dataEventsCount += 1
    stream.destroy()
  })

  await new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('close', () => {
      closeEmitted = true
      resolve()
    })
    stream.on('end', () => {
      endEmitted = true
      resolve()
    })
  })

  expect(dataEventsCount).toBeGreaterThan(0)
  expect(closeEmitted).toBe(true)
  expect(endEmitted).toBe(false)
  expect(scope.isDone()).toBe(true)
})