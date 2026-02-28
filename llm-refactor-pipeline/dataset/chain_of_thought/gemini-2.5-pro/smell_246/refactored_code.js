it('socket has write() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.once('socket', socket => {
      expect(socket.write).toBeInstanceOf(Function)
      // The original test implicitly checked that this call does not throw.
      // We keep it to preserve that behavior.
      socket.write('test')
      done()
    })
  })