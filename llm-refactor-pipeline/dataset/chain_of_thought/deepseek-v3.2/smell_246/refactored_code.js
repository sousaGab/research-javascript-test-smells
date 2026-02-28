it('socket has write() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.once('socket', socket => {
      expect(typeof socket.write).toBe('function')
      expect(() => socket.write('test')).not.toThrow()
      done()
    })
  })