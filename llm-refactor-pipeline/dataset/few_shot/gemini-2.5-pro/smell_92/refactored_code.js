it('works when headers are removed on the socket event', done => {
  const scope = nock('http://example.test', {
    badheaders: ['authorization'],
  })
    .get('/endpoint')
    .reply()

  const server = http.createServer((request, response) => {
    const proxyReq = http.request({
      host: 'example.test',
      path: request.url,
      headers: request.headers,
    })

    proxyReq.on('socket', () => {
      proxyReq.removeHeader('authorization')

      // The request must be ended inside the 'socket' event handler.
      // This ensures the header is removed before the request is sent,
      // as 'socket' fires on `process.nextTick()`.
      proxyReq.end()
    })

    proxyReq.on('response', proxyRes => {
      proxyRes.pipe(response)
    })

    proxyReq.on('error', error => {
      expect.fail(error)
      done()
    })
  })

  server
    .listen(() => {
      const req = http.request(
        {
          hostname: 'localhost',
          path: '/endpoint',
          port: server.address().port,
          method: 'GET',
          headers: {
            authorization: 'blah'
          },
        },
        res => {
          expect(res.statusCode).to.equal(200)
          scope.done()
          server.close(done)
        },
      )

      req.on('error', error => {
        expect.fail(error)
        done()
      })

      req.end()
    })
    .on('error', error => {
      expect.fail(error)
      done()
    })
})