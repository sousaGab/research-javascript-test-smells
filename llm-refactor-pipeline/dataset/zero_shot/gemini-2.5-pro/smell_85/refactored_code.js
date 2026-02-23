it('should not exceed the max files', async function () {
  const maxFilesAllowed = 3;
  const smallSizeToTriggerRotation = 2024;

  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: smallSizeToTriggerRotation,
    maxFiles: maxFilesAllowed,
    lazy: true
  });

  const logCountToExceedMaxFiles = 7;
  for (let i = 0; i < logCountToExceedMaxFiles; i++) {
    await logToTransport(transport);
  }

  const waitForFileRotation = () => new Promise(resolve => setTimeout(resolve, 5000));
  await waitForFileRotation();

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);