it('can destroy the socket if stream is not finished', async () => {
    const scope = nock('http://example.test')

    scope.intercept('/somepath', 'GET').reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

    const req = http.get('http://example.test/somepath')
    const stream = await new Promise(resolve => req.on('response', resolve))

    let didClose = false
    let didEnd = false

    // close after first chunk of data
    stream.on('data', () => stream.destroy())

    await new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('close', () => {
        didClose = true
        resolve()
      })
      stream.on('end', () => {
        didEnd = true
        // This should not be called, but we resolve to let the assertion fail the test
        resolve()
      })
    })

    expect(didClose).toBe(true)
    expect(didEnd).toBe(false)
  })