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

  // Wait for all file operations to complete
  await new Promise((resolve) => {
    const checkFiles = () => {
      try {
        assertFileExists('testarchive.log');
        assertFileExists('testarchive1.log');
        assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
        resolve();
      } catch (error) {
        // If assertions fail, retry after a short delay
        setTimeout(checkFiles, 100);
      }
    };
    checkFiles();
  });
}, 10000)