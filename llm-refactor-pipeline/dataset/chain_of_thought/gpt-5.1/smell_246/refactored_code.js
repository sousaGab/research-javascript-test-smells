it('socket has write() method', done => {
  nock('http://example.test').get('/').reply(200, 'hey')

  const req = http.get('http://example.test')
  req.once('socket', socket => {
    expect(typeof socket.write).toBe('function')

    const writeResult = socket.write('test')
    expect(writeResult === true || writeResult === false).toBe(true)

    done()
  })
})