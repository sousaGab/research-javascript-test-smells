it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    const request = http.get('http://example.test')
    request.on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        expect(request.aborted).toBe(true)
        done()
      })
    })
  })