it('socket has destroy() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey')

  const req = http.get('http://example.test')
  req.on('error', () => {}) // listen for error so it doesn't bubble
  req.once('socket', socket => {
    expect(typeof socket.destroy).toBe('function')
    socket.destroy()
    done()
  })
})