// Your COMPLETE refactored test code here
it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const waitForLogFileToContain = async (predicate, { timeoutMs = 5000, intervalMs = 25 } = {}) => {
    const start = Date.now();
    let lastError;

    while (Date.now() - start < timeoutMs) {
      try {
        const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
        if (predicate(contents)) return contents;
      } catch (err) {
        lastError = err;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    const error = new Error('Timed out waiting for log file to contain expected contents');
    error.cause = lastError;
    throw error;
  };

  process.emit('uncaughtException', expectedMessage);

  const contents = await waitForLogFileToContain(
    c => c && c.includes('uncaughtException: ' + expectedMessage),
    { timeoutMs: 5000, intervalMs: 25 }
  );

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});