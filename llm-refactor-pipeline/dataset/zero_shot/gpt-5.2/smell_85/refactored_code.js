it('should not exceed the max files', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 2024,
    maxFiles: 3,
    lazy: true
  });

  const writes = 7;
  await Promise.all(Array.from({ length: writes }, () => logToTransport(transport)));

  await new Promise(resolve => setTimeout(resolve, 5000));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);