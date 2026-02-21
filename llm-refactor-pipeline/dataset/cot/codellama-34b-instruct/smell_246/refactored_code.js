it('socket has write() method', async () => {
    nock('http://example.test').get('/').reply(200, 'hey')

    const req = http.get('http://example.test')
    const socket = await req.once('socket')
    socket.write('test')
    expect(socket.write).toBeCalledWith('test')
})