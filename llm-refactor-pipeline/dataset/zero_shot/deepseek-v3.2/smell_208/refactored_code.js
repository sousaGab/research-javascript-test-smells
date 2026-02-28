it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024,
    maxFiles: 3,
    lazy: true
  });

  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);
  await logToTransport(transport);

  await new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      try {
        assertFileExists('testarchive.log');
        assertFileExists('testarchive1.log');
        assertFileDoesNotExist('testarchive3.log');
        clearInterval(checkInterval);
        resolve();
      } catch (error) {
        if (Date.now() - startTime > 5000) {
          clearInterval(checkInterval);
          reject(new Error('Condition not met within timeout'));
        }
      }
    }, 100);
  });
}, 10000)