it('can be called without a callback', done => {
  nock('http://example.test').get('/').delayConnection(100).reply()

  const req = http.get('http://example.test')

  req.on('socket', socket => {
    socket.setTimeout(50)

    socket.on('timeout', () => {
      expect(socket.timeout).toBe(50)
      req.destroy()
      done()
    })
  })

  req.on('error', err => done(err))
})