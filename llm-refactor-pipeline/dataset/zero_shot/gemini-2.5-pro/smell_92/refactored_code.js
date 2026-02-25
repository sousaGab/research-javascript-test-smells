it('works when headers are removed on the socket event', done => {
  const apiMock = nock('http://example.test', {
    badheaders: ['authorization'],
  })
    .get('/endpoint')
    .reply(200);

  const proxyServer = http.createServer((req, res) => {
    const proxyReq = http.request({
      host: 'example.test',
      path: req.url,
      headers: req.headers,
    });

    proxyReq.on('socket', () => {
      proxyReq.removeHeader('authorization');
      proxyReq.end();
    });

    proxyReq.on('response', proxyRes => {
      proxyRes.pipe(res);
    });

    proxyReq.on('error', done);
  });

  proxyServer
    .listen(() => {
      const requestOptions = {
        hostname: 'localhost',
        path: '/endpoint',
        port: proxyServer.address().port,
        method: 'GET',
        headers: {
          authorization: 'some-token'
        },
      };

      const clientReq = http.request(requestOptions, res => {
        expect(res.statusCode).to.equal(200);
        apiMock.done();
        proxyServer.close(done);
      });

      clientReq.on('error', done);
      clientReq.end();
    })
    .on('error', done);
});