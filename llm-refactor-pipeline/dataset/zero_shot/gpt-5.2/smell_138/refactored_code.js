it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const waitForFileToContainMessage = async (path, message, { timeoutMs = 2000, intervalMs = 25 } = {}) => {
    const start = Date.now();
    let lastErr;

    while (Date.now() - start < timeoutMs) {
      try {
        const contents = await fsPromise.readFile(path, { encoding: 'utf8' });
        const data = JSON.parse(contents);
        if (typeof data?.message === 'string' && data.message.includes(message)) return data;
      } catch (err) {
        lastErr = err;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    if (lastErr) throw lastErr;
    throw new Error(`Timed out waiting for log file to contain message: ${message}`);
  };

  process.emit('uncaughtException', expectedMessage);

  const data = await waitForFileToContainMessage(filePath, 'uncaughtException: ' + expectedMessage);

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});