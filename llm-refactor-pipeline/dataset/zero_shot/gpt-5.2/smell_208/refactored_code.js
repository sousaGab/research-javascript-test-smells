it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024, // Small size to trigger frequent rotations
    maxFiles: 3, // Only allow 3 files total
    lazy: true
  });

  // Log well beyond enough data to create 3 files
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);

  // Deterministically wait for all pending writes/rotations to complete
  await new Promise((resolve, reject) => {
    const done = (err) => (err ? reject(err) : resolve());

    transport.once('error', done);

    // winston File transport is a stream; wait until it flushes
    if (typeof transport.end === 'function') {
      transport.end();
    }

    if (typeof transport.once === 'function') {
      transport.once('finish', () => done());
      transport.once('close', () => done());
    } else {
      done();
    }
  });

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);