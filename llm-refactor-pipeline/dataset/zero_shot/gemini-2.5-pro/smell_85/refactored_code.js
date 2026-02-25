it('should not exceed the max files', async function () {
  const maxFileSize = 2024;
  const maxLogFiles = 3;
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: maxFileSize,
    maxFiles: maxLogFiles,
    lazy: true
  });

  const logWritesToExceedMaxFiles = 7;
  for (let i = 0; i < logWritesToExceedMaxFiles; i++) {
    await logToTransport(transport);
  }

  await new Promise(resolve => setTimeout(resolve, 5000));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);