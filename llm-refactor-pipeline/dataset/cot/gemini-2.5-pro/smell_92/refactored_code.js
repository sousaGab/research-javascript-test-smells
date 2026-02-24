it('removes headers on the socket event before proxying a request', done => {
  const upstreamScope = nock('http://example.test', {
    badheaders: ['authorization'],
  })
    .get('/endpoint')
    .reply()

  const proxyServer = http.createServer((clientRequest, clientResponse) => {
    const upstreamRequest = http.request({
      host: 'example.test',
      path: clientRequest.url,
      headers: clientRequest.headers,
    })

    upstreamRequest.on('socket', () => {
      upstreamRequest.removeHeader('authorization')
      upstreamRequest.end()
    })

    upstreamRequest.on('response', upstreamResponse => {
      upstreamResponse.pipe(clientResponse)
    })

    upstreamRequest.on('error', error => {
      expect.fail(error)
      done()
    })
  })

  proxyServer
    .listen(() => {
      const requestToProxy = http.request(
        {
          hostname: 'localhost',
          path: '/endpoint',
          port: proxyServer.address().port,
          method: 'GET',
          headers: { authorization: 'some-token' },
        },
        res => {
          expect(res.statusCode).to.equal(200)
          upstreamScope.done()
          proxyServer.close(done)
        },
      )

      requestToProxy.on('error', error => {
        expect.fail(error)
        done()
      })

      requestToProxy.end()
    })
    .on('error', error => {
      expect.fail(error)
      done()
    })
})