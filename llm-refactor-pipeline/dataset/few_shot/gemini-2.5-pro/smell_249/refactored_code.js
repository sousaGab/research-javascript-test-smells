it('can destroy the socket if stream is not finished', async () => {
    const scope = nock('http://example.test')

    scope.intercept('/somepath', 'GET').reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

    const req = http.get('http://example.test/somepath')
    const stream = await new Promise(resolve => req.on('response', resolve))

    const events = {
      close: false,
      end: false,
    }

    stream.on('close', () => {
      events.close = true
    })
    stream.on('end', () => {
      events.end = true
    })

    // close after first chunk of data
    stream.on('data', () => stream.destroy())

    await new Promise((resolve, reject) => {
      stream.on('error', reject)
      stream.on('close', resolve)
    })

    expect(events.close).toBe(true)
    expect(events.end).toBe(false)
  })