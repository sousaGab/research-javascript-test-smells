it('socket has destroy() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.on('error', err => {
      // Assert that destroying the socket aborts the request.
      expect(err.code).toBe('ECONNRESET');
      done()
    })
    req.once('socket', socket => {
      socket.destroy()
    })
  })