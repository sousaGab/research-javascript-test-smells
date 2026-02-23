// Your COMPLETE refactored test code here

it('works when headers are removed on the socket event', done => {
    // Set up a nock that will fail if it gets an "authorization" header.
    const scope = nock('http://example.test', { badheaders: ['authorization'] })
      .get('/endpoint')
      .reply()

    // Create a server to act as our reverse proxy.
    const server = http.createServer((request, response) => {
      // Make a request to the nock instance with the same request that came in.
      const proxyReq = http.request({
        host: 'example.test',
        // Get the path from the incoming request and pass it through.
        path: `/${request.url.split('/').slice(1).join('/')}`,
        headers: request.headers,
      })

      // When we connect, remove the authorization header (node-http-proxy uses
      // this event to do it).
      proxyReq.on('socket', () => {
        proxyReq.removeHeader('authorization')

        // End the request here, otherwise it ends up matching the request before
        // socket gets called because socket runs on `process.nextTick()`.
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
        // Now that the server's started up, make a request to it with an authorization header.
        const req = http.request(
          {
            hostname: 'localhost',
            path: '/endpoint',
            port: server.address().port,
            method: 'GET',
            headers: { authorization: 'blah' },
          },
          res => {
            // If we get a request, all good :)
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