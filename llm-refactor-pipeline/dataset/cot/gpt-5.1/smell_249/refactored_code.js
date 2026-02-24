it('can destroy the socket if stream is not finished', async () => {
  const scope = nock('http://example.test')

  scope.intercept('/somepath', 'GET').reply(() => {
    const buffer = Buffer.allocUnsafe(10000000)
    const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
    return [200, data]
  })

  const req = http.get('http://example.test/somepath')
  const stream = await new Promise(resolve => req.on('response', resolve))

  let dataEvents = 0
  let closeCalled = false
  let endCalled = false
  let errorOccurred = false

  // close after first chunk of data
  stream.on('data', () => {
    dataEvents += 1
    stream.destroy()
  })

  await new Promise((resolve, reject) => {
    stream.on('error', err => {
      errorOccurred = true
      reject(err)
    })
    stream.on('close', () => {
      closeCalled = true
      resolve()
    })
    stream.on('end', () => {
      endCalled = true
      resolve()
    })
  })

  expect(dataEvents).toBeGreaterThanOrEqual(1)
  expect(closeCalled).toBe(true)
  expect(endCalled).toBe(false)
  expect(errorOccurred).toBe(false)
  expect(scope.isDone()).toBe(true)
})