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

  assertFileContentsStartWith('testarchive.log', undefined);
  assertFileContentsStartWith('testarchive1.log', 'B');
  assertFileContentsStartWith('testarchive2.log', 'C');
});