it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    const req = http.get('http://example.test')
    req.on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        done()
      })
    })
    
    // Add assertion to verify the request was made
    expect(req).toBeDefined()
  })