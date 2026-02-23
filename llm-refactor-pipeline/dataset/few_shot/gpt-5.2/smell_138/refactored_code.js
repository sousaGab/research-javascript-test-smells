it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const waitForFileToBeWritten = async (path, { timeoutMs = 2000, intervalMs = 10 } = {}) => {
    const start = Date.now();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const contents = await fsPromise.readFile(path, { encoding: 'utf8' });
        const data = JSON.parse(contents);
        if (data && typeof data === 'object') return data;
      } catch (err) {
        // ignore until file exists and contains valid JSON
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timed out waiting for log file to be written: ${path}`);
      }

      await new Promise(resolve => setImmediate(resolve));
    }
  };

  process.emit('uncaughtException', expectedMessage);

  const data = await waitForFileToBeWritten(filePath);

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});