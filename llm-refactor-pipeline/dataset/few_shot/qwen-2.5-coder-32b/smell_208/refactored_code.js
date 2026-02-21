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

  // Wait for file rotation to complete using a callback-based approach
  await new Promise((resolve) => {
    const checkFiles = () => {
      // Check if expected files exist and unwanted file doesn't
      if (assertFileExists('testarchive.log') && 
          assertFileExists('testarchive1.log') && 
          !assertFileExists('testarchive3.log')) {
        resolve();
      } else {
        setTimeout(checkFiles, 100); // Poll every 100ms
      }
    };
    checkFiles();
  });

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000)