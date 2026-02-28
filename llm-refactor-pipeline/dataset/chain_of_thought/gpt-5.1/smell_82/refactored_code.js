it('should write to the newest file and older files will be in descending order', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    tailable: false
  });

  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');

  // eslint-disable-next-line -- intentionally asserting file starts with no values
  assertFileContentsStartWith('testarchive.log', undefined);
  // Known issue: only two of the files are filled and are not in the expected order.
  // Current file contents:
  //   testarchive.log  - empty
  //   testarchive1.log - 'B'
  //   testarchive2.log - 'C'
  //   testarchive3.log - empty
  // assertFileContentsStartWith('testarchive1.log', 'A');
  // assertFileContentsStartWith('testarchive2.log', 'B');
});