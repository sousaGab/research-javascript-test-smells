it('should delete the oldest file when maxfiles is met', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 1024,
    maxFiles: 2,
    lazy: true
  });

  await logToTransport(transport);
  await waitForFile('testarchive.log');

  await logToTransport(transport);
  await waitForFile('testarchive1.log');

  await logToTransport(transport, { kbytes: 0.5 });
  await waitForFile('testarchive2.log');

  assertFileDoesNotExist('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
});