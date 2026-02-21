it('can be called without a callback', done => {
    const mock = nock('http://example.test')
        .get('/')
        .delayConnection(100)
        .reply()

    const req = http.get('http://example.test')
    
    req.on('socket', socket => {
        socket.setTimeout(50)
        
        socket.on('timeout', () => {
            mock.done()
            done()
        })
    })
})