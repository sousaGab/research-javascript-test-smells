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

  // Synchronize on the transport finishing all pending writes/rotations
  await new Promise((resolve, reject) => {
    const cleanup = () => {
      transport.removeListener('finish', onFinish);
      transport.removeListener('error', onError);
      transport.removeListener('close', onClose);
    };

    const onFinish = () => {
      cleanup();
      resolve();
    };

    const onClose = () => {
      cleanup();
      resolve();
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    transport.once('finish', onFinish);
    transport.once('close', onClose);
    transport.once('error', onError);

    // End the stream so it flushes all buffered data and emits finish/close
    if (typeof transport.end === 'function') transport.end();
    else if (typeof transport.close === 'function') transport.close();
    else resolve();
  });

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);