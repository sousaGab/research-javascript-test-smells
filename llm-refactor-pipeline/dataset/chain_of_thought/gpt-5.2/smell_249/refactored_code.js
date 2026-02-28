it('can destroy the socket if stream is not finished', async () => {
  const scope = nock('http://example.test');

  scope.intercept('/somepath', 'GET').reply(() => {
    const buffer = Buffer.allocUnsafe(10000000);
    const data = new MemoryReadableStream(buffer, { highWaterMark: 128 });
    return [200, data];
  });

  const req = http.get('http://example.test/somepath');
  const stream = await new Promise((resolve, reject) => {
    req.on('response', resolve);
    req.on('error', reject);
  });

  let sawData = false;
  let sawClose = false;
  let sawEnd = false;
  let sawError = false;

  stream.on('data', () => {
    sawData = true;
    stream.destroy();
  });

  stream.on('close', () => {
    sawClose = true;
  });

  stream.on('end', () => {
    sawEnd = true;
  });

  stream.on('error', () => {
    sawError = true;
  });

  await new Promise((resolve, reject) => {
    stream.once('close', resolve);
    stream.once('end', resolve);
    stream.once('error', reject);
  });

  expect(scope.isDone()).toBe(true);
  expect(sawData).toBe(true);
  expect(sawClose || sawEnd).toBe(true);
  expect(sawEnd).toBe(false);
  expect(sawError).toBe(false);
});