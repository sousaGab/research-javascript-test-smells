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

  // Wait for file rotation to complete using a more reliable approach
  await new Promise(resolve => {
    const checkFiles = () => {
      const exists1 = fs.existsSync('testarchive.log');
      const exists2 = fs.existsSync('testarchive1.log');
      const exists3 = fs.existsSync('testarchive2.log');
      const exists4 = fs.existsSync('testarchive3.log');
      
      // All expected files should exist, but the 4th should not
      if (exists1 && exists2 && exists3 && !exists4) {
        resolve();
      } else {
        setTimeout(checkFiles, 100);
      }
    };
    checkFiles();
  });

  // Should have 3 files total (maxFiles)
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log'); // This should not exist because maxFiles = 3
}, 10000)