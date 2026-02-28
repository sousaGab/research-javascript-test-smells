// Your COMPLETE refactored test code here

it('can be called without a callback', done => {
    nock('http://example.test').get('/').delayConnection(100).reply()

    http.get('http://example.test').on('socket', socket => {
      socket.setTimeout(50)

      socket.on('timeout', () => {
        expect(socket.timeout).toBe(50);
        done()
      })
    })
  })