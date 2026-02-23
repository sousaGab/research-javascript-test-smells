it('works when headers are removed on the socket event', done => {
  const scope = nock('http://example.test', { badheaders: ['authorization'] })
    .get('/endpoint')
    .reply()

  const createProxyServer = () =>
    http.createServer((request, response) => {
      const proxyReq = http.request({
        host: 'example.test',
        path: `/${request.url.split('/').slice(1).join('/')}`,
        headers: request.headers,
      })

      proxyReq.on('socket', () => {
        proxyReq.removeHeader('authorization')
        proxyReq.end()
      })

      proxyReq.on('response', proxyRes => proxyRes.pipe(response))
      proxyReq.on('error', done)
    })

  const sendRequestThroughProxy = server =>
    http.request(
      {
        hostname: 'localhost',
        path: '/endpoint',
        port: server.address().port,
        method: 'GET',
        headers: { authorization: 'blah' },
      },
      res => {
        expect(res.statusCode).to.equal(200)
        scope.done()
        server.close(done)
      },
    )

  const server = createProxyServer()

  server.listen(() => {
    const req = sendRequestThroughProxy(server)
    req.on('error', done)
    req.end()
  })

  server.on('error', done)
})