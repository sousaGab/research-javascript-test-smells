it('emits a timeout event when the connection is delayed', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    let timeoutFired = false;

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        timeoutFired = true;
        expect(timeoutFired).toBe(true);
        done();
      })
    })
  })