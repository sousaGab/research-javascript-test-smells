it('should not exceed the max files', async function () {
  const maxFiles = 3;
  const smallMaxSizeToForceRotation = 2024;
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: smallMaxSizeToForceRotation,
    maxFiles: maxFiles,
    lazy: true
  });

  const logCyclesToExceedMaxFiles = 7;
  for (let i = 0; i < logCyclesToExceedMaxFiles; i++) {
    await logToTransport(transport);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);