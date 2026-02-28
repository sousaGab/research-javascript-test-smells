it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  // Create a promise that resolves when the file is written
  const fileWrittenPromise = new Promise((resolve) => {
    const checkFile = async () => {
      try {
        const stats = await fsPromise.stat(filePath);
        if (stats.size > 0) {
          resolve();
        } else {
          setTimeout(checkFile, 10);
        }
      } catch {
        setTimeout(checkFile, 10);
      }
    };
    checkFile();
  });

  process.emit('uncaughtException', expectedMessage);
  await fileWrittenPromise;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});