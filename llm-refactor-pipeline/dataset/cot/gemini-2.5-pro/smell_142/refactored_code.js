it('respects http.request() consumers', async () => {
  const requestListener = (req, res) => {
    res.write('foo');
    setTimeout(() => {
      res.end('bar');
    }, 25);
  };

  const { port } = await servers.startHttpServer(requestListener);

  nock.restore();
  nock.recorder.clear();
  nock.recorder.rec({
    dont_print: true,
    output_objects: true,
  });

  const responseBody = await new Promise(resolve => {
    const req = http.request(
      {
        host: 'localhost',
        port,
        path: '/',
      },
      res => {
        let buffer = Buffer.from('');
        res.on('data', data => {
          buffer = Buffer.concat([buffer, data]);
        });
        res.on('end', () => {
          resolve(buffer.toString());
        });
      },
    );
    req.end();
  });

  nock.restore();
  expect(responseBody).to.equal('foobar');
});