it('should write to the current file and rotate recent files correctly', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  // Log enough data to trigger multiple file rotations
  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');
  await logToTransport(transport, { kbytes: 1, char: 'D' });
  await waitForFile('testarchive3.log');

  // Verify the expected files exist
  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
  assertFileExists('testarchive3.log');

  // Verify the contents of the files are in the expected tailable order
  assertFileContentsStartWith('testarchive.log', 'D');
  assertFileContentsStartWith('testarchive1.log', 'C');
  assertFileContentsStartWith('testarchive2.log', 'B');
});

it.skip('should preserve the content of the oldest rotated file', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  // Log enough data to trigger multiple file rotations
  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');
  await logToTransport(transport, { kbytes: 1, char: 'D' });
  await waitForFile('testarchive3.log');

  // This documents a known issue: the first file that was rolled ('A')
  // is expected to be in 'testarchive3.log', but the file is empty.
  assertFileContentsStartWith('testarchive3.log', 'A');
});