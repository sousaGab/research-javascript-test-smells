it('can destroy the socket if stream is not finished', async () => {
    const scope = nock('http://example.test')

    scope.intercept('/somepath', 'GET').reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

    const req = http.get('http://example.test/somepath')
    const stream = await new Promise(resolve => req.on('response', resolve))

    let dataReceived = false
    let streamDestroyed = false
    
    stream.on('data', () => {
      dataReceived = true
      stream.destroy()
      streamDestroyed = true
    })

    await new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('close', resolve)
      stream.on('end', resolve)
    })

    expect(dataReceived).toBe(true)
    expect(streamDestroyed).toBe(true)
    expect(stream.destroyed).toBe(true)
  })