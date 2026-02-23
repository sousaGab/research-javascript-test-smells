it('should delete the oldest file when maxfiles is met', async function () {
  const transport = new winston.transports.File({
    ...defaultTransportOptions,
    maxsize: 1024,
    maxFiles: 2,
    lazy: true
  });

  const createLogFile = async (filename, options) => {
    await logToTransport(transport, options);
    await waitForFile(filename);
  };

  await createLogFile('testarchive.log');
  await createLogFile('testarchive1.log');
  await createLogFile('testarchive2.log', { kbytes: 0.5 });

  assertFileDoesNotExist('testarchive.log');
  assertFileExists('testarchive1.log');
  assertFileExists('testarchive2.log');
});