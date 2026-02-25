it('socket has destroy() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')

    req.on('error', err => {
      expect(err).to.be.an.instanceOf(Error)
      // Destroying the socket should result in a connection reset error.
      expect(err.code).to.equal('ECONNRESET')
      done()
    })

    req.once('socket', socket => {
      // The test title implies we should check for the method's existence.
      expect(socket.destroy).to.be.a('function')
      socket.destroy()
    })
  })