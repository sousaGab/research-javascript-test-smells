it('should delete the oldest file when maxfiles is met', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 1024, // Small size to trigger frequent rotations
    maxFiles: 2, // Only allow 2 files total
    lazy: true // Ensure files are created immediately
  });

  // Create first log file
  await logToTransport(transport);
  await waitForFile('testarchive.log');

  // Create second log file
  await logToTransport(transport);
  await waitForFile('testarchive1.log');

  // Create third log file (should delete the oldest one)
  await logToTransport(transport, { kbytes: 0.5 });
  await waitForFile('testarchive2.log');

  // Assert that the oldest file was deleted
  assertFileDoesNotExist('testarchive.log');

  // Assert that the remaining files exist
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
})