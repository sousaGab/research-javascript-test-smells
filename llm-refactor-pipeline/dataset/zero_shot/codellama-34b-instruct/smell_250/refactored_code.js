it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        done()
      })
    })

    // Add an assertion to verify that the HTTP request is successful
    expect(http.get('http://example.test')).to.have.status(200)
  })