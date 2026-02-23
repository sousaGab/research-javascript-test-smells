it('works when headers are removed on the socket event', done => {
  const scope = nock('http://example.test', { badheaders: ['authorization'] })
    .get('/endpoint')
    .reply()

  const createProxyRequest = request =>
    http.request({
      host: 'example.test',
      path: `/${request.url.split('/').slice(1).join('/')}`,
      headers: request.headers,
    })

  const removeAuthorizationHeaderOnSocket = proxyReq => {
    proxyReq.on('socket', () => {
      proxyReq.removeHeader('authorization')
      proxyReq.end()
    })
  }

  const pipeProxyResponse = (proxyReq, response) => {
    proxyReq.on('response', proxyRes => proxyRes.pipe(response))
  }

  const failTestOnError = emitter => {
    emitter.on('error', error => {
      expect.fail(error)
      done()
    })
  }

  const server = http.createServer((request, response) => {
    const proxyReq = createProxyRequest(request)

    removeAuthorizationHeaderOnSocket(proxyReq)
    pipeProxyResponse(proxyReq, response)
    failTestOnError(proxyReq)
  })

  server.listen(() => {
    const req = http.request(
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

    failTestOnError(req)
    req.end()
  })

  failTestOnError(server)
})