it('socket has destroy() method', async () => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    req.on('error', () => {}) // listen for error so it doesn't bubble
    const socket = await req.once('socket')
    socket.destroy()
    expect(socket.destroyed).toBe(true)
})