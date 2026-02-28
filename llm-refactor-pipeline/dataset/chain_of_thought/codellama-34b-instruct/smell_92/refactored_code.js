it('works when headers are removed on the socket event', done => {
    const nockScope = nock('http://example.test', { badheaders: ['authorization'] })
      .get('/endpoint')
      .reply()

    const server = http.createServer((request, response) => {
      const proxyRequest = http.request({
        host: 'example.test',
        path: `/${request.url.split('/').slice(1).join('/')}`,
        headers: request.headers,
      })

      proxyRequest.on('socket', () => {
        proxyRequest.removeHeader('authorization')
        proxyRequest.end()
      })

      proxyRequest.on('response', proxyResponse => {
        proxyResponse.pipe(response)
      })

      proxyRequest.on('error', error => {
        expect.fail(error)
        done()
      })
    })

    server
      .listen(() => {
        const request = http.request(
          {
            hostname: 'localhost',
            path: '/endpoint',
            port: server.address().port,
            method: 'GET',
            headers: { authorization: 'blah' },
          },
          response => {
            expect(response.statusCode).to.equal(200)
            nockScope.done()
            server.close(done)
          },
        )

        request.on('error', error => {
          expect.fail(error)
          done()
        })

        request.end()
      })
      .on('error', error => {
        expect.fail(error)
        done()
      })
  })