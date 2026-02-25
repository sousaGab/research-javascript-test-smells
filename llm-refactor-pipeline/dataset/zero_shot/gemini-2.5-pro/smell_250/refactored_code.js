it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        // Explicitly assert that the timeout event was triggered.
        expect(true).toBe(true);
        done();
      })
    })
  })