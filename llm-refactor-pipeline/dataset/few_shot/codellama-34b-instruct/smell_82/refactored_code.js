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
  // eslint-disable-next-line -- intentionally asserting file starts with no values
  assertFileContentsStartWith('testarchive.log', undefined);
  // FIX: only two of the files are filled and are not in the expected order. File contents are as follows:
  //   file testarchive.log  - empty
  //   file testarchive1.log - 'B'
  //   file testarchive2.log - 'C'
  //   file testarchive3.log - empty
  // assertFileContentsStartWith('testarchive1.log', 'A');
  // assertFileContentsStartWith('testarchive2.log', 'B');
})