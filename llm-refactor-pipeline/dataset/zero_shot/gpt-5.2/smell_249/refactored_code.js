it('can destroy the socket if stream is not finished', async () => {
  const scope = nock('http://example.test');

  scope.intercept('/somepath', 'GET').reply(() => {
    const buffer = Buffer.allocUnsafe(10000000);
    const data = new MemoryReadableStream(buffer, { highWaterMark: 128 });
    return [200, data];
  });

  const req = http.get('http://example.test/somepath');
  const stream = await new Promise((resolve, reject) => {
    req.once('response', resolve);
    req.once('error', reject);
  });

  let sawData = false;
  let sawClose = false;
  let sawEnd = false;
  let sawError = false;

  stream.on('data', () => {
    sawData = true;
    stream.destroy();
  });

  await new Promise((resolve, reject) => {
    stream.once('close', () => {
      sawClose = true;
      resolve();
    });
    stream.once('end', () => {
      sawEnd = true;
      resolve();
    });
    stream.once('error', (err) => {
      sawError = true;
      reject(err);
    });
  });

  expect(sawData).toBe(true);
  expect(sawError).toBe(false);
  expect(sawClose || sawEnd).toBe(true);
  expect(sawClose).toBe(true);
  expect(sawEnd).toBe(false);

  expect(scope.isDone()).toBe(true);
});