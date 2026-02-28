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

  // Wait for the transport to finish processing all logs
  if (typeof transport.on === 'function') {
    await new Promise((resolve, reject) => {
      const onError = (err) => {
        transport.removeListener('finish', onFinish);
        reject(err);
      };
      const onFinish = () => {
        transport.removeListener('error', onError);
        resolve();
      };

      transport.once('finish', onFinish);
      transport.once('error', onError);

      // End the stream to flush all pending writes
      if (typeof transport.end === 'function') {
        transport.end();
      } else if (typeof transport.close === 'function') {
        transport.close();
      } else {
        // If neither end nor close exists, resolve immediately
        transport.removeListener('finish', onFinish);
        transport.removeListener('error', onError);
        resolve();
      }
    });
  }

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);