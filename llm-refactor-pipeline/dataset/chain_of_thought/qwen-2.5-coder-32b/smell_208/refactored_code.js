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

  // Wait for file rotation to complete using event-based synchronization
  await new Promise((resolve) => {
    const checkFiles = () => {
      // Check if the expected files exist and the unwanted one doesn't
      if (assertFileExists('testarchive.log') && 
          assertFileExists('testarchive1.log') && 
          !assertFileExists('testarchive3.log')) {
        resolve();
      } else {
        // Poll every 10ms until files are processed
        setTimeout(checkFiles, 10);
      }
    };
    checkFiles();
  });

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000);