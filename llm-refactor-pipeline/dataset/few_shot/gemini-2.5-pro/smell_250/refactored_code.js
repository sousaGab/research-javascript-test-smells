it('can be called without a callback', done => {
    let timeoutFired = false;
    nock('http://example.test').get('/').delayConnection(100).reply()

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        timeoutFired = true;
        expect(timeoutFired).toBe(true);
        done();
      })
    })
  })