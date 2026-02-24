it('socket has destroy() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey')

  const req = http.get('http://example.test')
  req.on('error', () => {}) // listen for error so it doesn't bubble
  req.once('socket', socket => {
    expect(typeof socket.destroy).toBe('function')

    const destroySpy = jest.spyOn(socket, 'destroy')
    socket.destroy()

    expect(destroySpy).toHaveBeenCalledTimes(1)
    destroySpy.mockRestore()
    done()
  })
})