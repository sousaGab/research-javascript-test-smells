it('can destroy the socket if stream is not finished', async () => {
    const scope = nock('http://example.test')

    scope.intercept('/somepath', 'GET').reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

    const req = http.get('http://example.test/somepath')
    const stream = await new Promise(resolve => req.on('response', resolve))

    let endCalled = false
    let closeCalled = false

    // close after first chunk of data
    stream.on('data', () => stream.destroy())
    stream.on('end', () => {
      endCalled = true
    })
    stream.on('close', () => {
      closeCalled = true
    })

    await new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('close', resolve)
    })

    expect(closeCalled).toBe(true)
    expect(endCalled).toBe(false)
    expect(stream.destroyed).toBe(true)
  })