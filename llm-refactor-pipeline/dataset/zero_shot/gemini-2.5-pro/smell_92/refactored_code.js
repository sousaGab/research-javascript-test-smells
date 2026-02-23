it('works when headers are removed on the socket event', async () => {
  const scope = nock('http://example.test', {
    badheaders: ['authorization'],
  })
    .get('/endpoint')
    .reply(200)

  const server = http.createServer((request, response) => {
    const proxyReq = http.request({
      host: 'example.test',
      path: request.url,
      headers: request.headers,
    })

    proxyReq.on('socket', () => {
      proxyReq.removeHeader('authorization')
      proxyReq.end()
    })

    proxyReq.on('response', proxyRes => {
      proxyRes.pipe(response)
    })

    proxyReq.on('error', error => {
      response.writeHead(500)
      response.end(error.message)
    })
  })

  try {
    const port = await new Promise((resolve, reject) => {
      server.on('error', reject)
      server.listen(() => {
        resolve(server.address().port)
      })
    })

    const res = await new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: 'localhost',
          path: '/endpoint',
          port,
          method: 'GET',
          headers: { authorization: 'blah' },
        },
        resolve,
      )
      req.on('error', reject)
      req.end()
    })

    expect(res.statusCode).to.equal(200)
    scope.done()
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})