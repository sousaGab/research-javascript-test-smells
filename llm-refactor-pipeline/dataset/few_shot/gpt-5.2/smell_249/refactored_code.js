it('can destroy the socket if stream is not finished', async () => {
  const scope = nock('http://example.test');

  scope.intercept('/somepath', 'GET').reply(() => {
    const buffer = Buffer.allocUnsafe(10000000);
    const data = new MemoryReadableStream(buffer, { highWaterMark: 128 });
    return [200, data];
  });

  const req = http.get('http://example.test/somepath');
  const stream = await new Promise(resolve => req.on('response', resolve));

  let sawData = false;
  let sawClose = false;
  let sawEnd = false;
  let error = null;

  stream.on('data', () => {
    sawData = true;
    stream.destroy();
  });

  await new Promise(resolve => {
    stream.on('error', err => {
      error = err;
      resolve();
    });
    stream.on('close', () => {
      sawClose = true;
      resolve();
    });
    stream.on('end', () => {
      sawEnd = true;
      resolve();
    });
  });

  expect(sawData).toBe(true);
  expect(error).toBeNull();
  expect(sawClose || sawEnd).toBe(true);
  expect(scope.isDone()).toBe(true);
});