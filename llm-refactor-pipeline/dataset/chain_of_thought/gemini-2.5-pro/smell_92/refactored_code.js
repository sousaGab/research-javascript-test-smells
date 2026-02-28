it('succeeds when a proxy removes a forbidden header on the socket event', done => {
  const UPSTREAM_HOST = 'example.test';
  const UPSTREAM_URL = `http://${UPSTREAM_HOST}`;
  const ENDPOINT_PATH = '/endpoint';
  const FORBIDDEN_HEADER = 'authorization';

  const scope = nock(UPSTREAM_URL, {
    badheaders: [FORBIDDEN_HEADER],
  })
    .get(ENDPOINT_PATH)
    .reply(200);

  const createProxyThatRemovesHeader = (headerName, targetHost) =>
    http.createServer((incomingRequest, proxyResponse) => {
      const proxyRequest = http.request({
        host: targetHost,
        path: incomingRequest.url,
        headers: incomingRequest.headers,
      });

      proxyRequest.on('socket', () => {
        proxyRequest.removeHeader(headerName);
        proxyRequest.end();
      });

      proxyRequest.on('response', upstreamResponse => {
        upstreamResponse.pipe(proxyResponse);
      });

      proxyRequest.on('error', error => {
        expect.fail(error);
        done();
      });
    });

  const proxyServer = createProxyThatRemovesHeader(
    FORBIDDEN_HEADER,
    UPSTREAM_HOST
  );

  proxyServer
    .listen(() => {
      const requestOptions = {
        hostname: 'localhost',
        path: ENDPOINT_PATH,
        port: proxyServer.address().port,
        method: 'GET',
        headers: { [FORBIDDEN_HEADER]: 'some-token' },
      };

      const clientRequest = http.request(requestOptions, response => {
        expect(response.statusCode).to.equal(200);
        scope.done();
        proxyServer.close(done);
      });

      clientRequest.on('error', error => {
        expect.fail(error);
        done();
      });

      clientRequest.end();
    })
    .on('error', error => {
      expect.fail(error);
      done();
    });
});