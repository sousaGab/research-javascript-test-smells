it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024, // Small size to trigger frequent rotations
    maxFiles: 3, // Only allow 3 files total
    lazy: true
  });

  // Helper that returns a promise resolved when the transport finishes processing
  function waitForTransportDrain(transportInstance) {
    return new Promise((resolve, reject) => {
      const onFinish = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        transportInstance.removeListener('finish', onFinish);
        transportInstance.removeListener('error', onError);
      };

      transportInstance.once('finish', onFinish);
      transportInstance.once('error', onError);

      // End the stream to flush all logs and trigger 'finish'
      transportInstance.end();
    });
  }

  // Log well beyond enough data to create 3 files
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);

  // Wait deterministically for the transport to finish processing all logs
  await waitForTransportDrain(transport);

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);