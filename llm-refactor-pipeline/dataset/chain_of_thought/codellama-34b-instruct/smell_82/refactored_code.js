// Your COMPLETE refactored test code here
it('should write to the newest file and older files will be in descending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    tailable: false
  });

  // We need to log enough data to create 3 files of 4KB each = 12KB total
  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');

  // Verify the expected files exist
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');

  // Verify the contents of the files are in the expected order
  assertFileContentsStartWith('testarchive.log', undefined);
  assertFileContentsStartWith('testarchive1.log', 'A');
  assertFileContentsStartWith('testarchive2.log', 'B');
})