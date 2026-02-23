it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const waitForFileToContainJson = async (path, { timeoutMs = 2000, intervalMs = 25 } = {}) => {
    const start = Date.now();
    let lastErr;

    while (Date.now() - start < timeoutMs) {
      try {
        const contents = await fsPromise.readFile(path, { encoding: 'utf8' });
        if (contents && contents.trim().length > 0) {
          return JSON.parse(contents);
        }
      } catch (err) {
        lastErr = err;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw lastErr || new Error(`Timed out waiting for log file: ${path}`);
  };

  process.emit('uncaughtException', expectedMessage);

  const data = await waitForFileToContainJson(filePath);

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});