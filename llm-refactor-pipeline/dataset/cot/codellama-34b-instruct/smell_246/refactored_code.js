// Your COMPLETE refactored test code here

it('socket has write() method', done => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.once('socket', socket => {
      socket.write('test')
      expect(socket.write).toHaveBeenCalledWith('test')
      done()
    })
  })