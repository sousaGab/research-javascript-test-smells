it('socket has write() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.once('socket', socket => {
      expect(socket.write).to.be.a('function')
      socket.write('test')
      done()
    })
  })