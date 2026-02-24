it('can destroy the socket if stream is not finished', async () => {
    const scope = nock('http://example.test')

    scope.intercept('/somepath', 'GET').reply(() => {
      const buffer = Buffer.allocUnsafe(10000000)
      const data = new MemoryReadableStream(buffer, { highWaterMark: 128 })
      return [200, data]
    })

    const req = http.get('http://example.test/somepath')
    const stream = await new Promise(resolve => req.on('response', resolve))

    let closeEventEmitted = false
    let endEventEmitted = false
    let errorEventEmitted = false

    // close after first chunk of data
    stream.on('data', () => stream.destroy())

    await new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        errorEventEmitted = true
        reject(err)
      })
      stream.on('close', () => {
        closeEventEmitted = true
        resolve()
      })
      stream.on('end', () => {
        endEventEmitted = true
        resolve()
      })
    })

    expect(stream.destroyed).toBe(true)
    expect(closeEventEmitted).toBe(true)
    expect(endEventEmitted).toBe(false)
    expect(errorEventEmitted).toBe(false)
  })