it('socket has destroy() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey')

  const req = http.get('http://example.test')
  req.on('error', () => {}) // listen for error so it doesn't bubble
  req.once('socket', socket => {
    assert.strictEqual(socket.destroyed, false, 'Socket should not be destroyed initially')
    socket.destroy()
    assert.strictEqual(socket.destroyed, true, 'Socket should be destroyed after calling destroy()')
    done()
  })
})