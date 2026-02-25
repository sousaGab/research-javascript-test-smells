it('should not exceed the max files', async function () {
  const smallSizeToTriggerRotation = 2024;
  const maxAllowedFiles = 3;

  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: smallSizeToTriggerRotation,
    maxFiles: maxAllowedFiles,
    lazy: true
  });

  const logCountToExceedMaxFiles = maxAllowedFiles * 2 + 1;
  for (let i = 0; i < logCountToExceedMaxFiles; i++) {
    await logToTransport(transport);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);