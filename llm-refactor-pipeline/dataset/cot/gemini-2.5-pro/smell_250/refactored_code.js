it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        // Assert that the timeout event leads to the socket being destroyed.
        // This makes the test's success condition explicit.
        expect(socket.destroyed).toBe(true);
        done()
      })
    })
  })