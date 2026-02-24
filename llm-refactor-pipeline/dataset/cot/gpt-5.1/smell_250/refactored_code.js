it('emits a timeout event when called without a callback', done => {
  const scope = nock('http://example.test').get('/').delayConnection(100).reply()

  const req = http.get('http://example.test')

  req.on('socket', socket => {
    socket.setTimeout(50)

    socket.on('timeout', () => {
      expect(scope.isDone()).toBe(true)
      expect(req.aborted || req.destroyed).toBe(true)
      done()
    })
  })
})