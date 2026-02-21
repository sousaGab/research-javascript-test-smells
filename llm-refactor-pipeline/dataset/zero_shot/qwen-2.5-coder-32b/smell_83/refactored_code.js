it('should maintain tailable log files with ascending order when maxFiles is exceeded', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  // Log enough data to create 4 files (4KB each = 16KB total)
  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');
  await logToTransport(transport, { kbytes: 1, char: 'D' });
  await waitForFile('testarchive3.log');

  // Verify all expected files exist
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
  assertFileExists('testarchive3.log');

  // Verify file contents follow expected order
  assertFileContentsStartWith('testarchive.log', 'D');
  assertFileContentsStartWith('testarchive1.log', 'C');
  assertFileContentsStartWith('testarchive2.log', 'B');
  assertFileContentsStartWith('testarchive3.log', 'A');
});