it('should not exceed the max files', async function () {
  const MAX_FILES = 3;
  const MAX_SIZE = 2024;
  const LOG_ITERATIONS = 7;
  const ROTATION_WAIT_MS = 5000;

  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: MAX_SIZE,
    maxFiles: MAX_FILES,
    lazy: true
  });

  for (let i = 0; i < LOG_ITERATIONS; i++) {
    await logToTransport(transport);
  }

  await new Promise(resolve => setTimeout(resolve, ROTATION_WAIT_MS));

  assertFileExists('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileDoesNotExist('testarchive3.log');
}, 10000);