it('should manage file rotation with tailable option', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxFiles: 4,
    tailable: true
  });

  await logToTransport(transport, { kbytes: 4, char: 'A' });
  await waitForFile('testarchive.log');
  await logToTransport(transport, { kbytes: 4, char: 'B' });
  await waitForFile('testarchive1.log');
  await logToTransport(transport, { kbytes: 4, char: 'C' });
  await waitForFile('testarchive2.log');
  await logToTransport(transport, { kbytes: 1, char: 'D' });
  await waitForFile('testarchive3.log');

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
  assertFileExists('testarchive3.log');

  assertFileContentsStartWith('testarchive.log', 'D');
  assertFileContentsStartWith('testarchive1.log', 'C');
  assertFileContentsStartWith('testarchive2.log', 'B');
});