// Your COMPLETE refactored test code here
it('should write to original file and older files will be in ascending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  // We need to log enough data to create 3 files of 4KB each = 12KB total
  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');
  await logToTransport(transport, { kbytes: 1, char: 'D' });
  await waitForFile('testarchive3.log');

  // Verify the expected files exist and their contents are correct
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
  assertFileExists('testarchive3.log');

  // Verify the contents of the files are in the expected order
  assertFileContentsStartWith('testarchive.log', 'D');
  assertFileContentsStartWith('testarchive1.log', 'C');
  assertFileContentsStartWith('testarchive2.log', 'B');
  // FIX: I would expect the first file that was rolled to be filled with the first log message
  // instead the file is empty. Investigation needed.
  // assertFileContentsStartWith('testarchive3.log', 'A');
})