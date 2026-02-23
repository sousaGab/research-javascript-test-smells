// Your COMPLETE refactored test code here
it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const waitForLogFileToBeWritten = async (path, timeoutMs = 2000) => {
    const start = Date.now();
    // Poll until the file exists and contains valid JSON
    // (avoids fixed sleeps while still waiting deterministically for the side-effect)
    while (Date.now() - start < timeoutMs) {
      try {
        const contents = await fsPromise.readFile(path, { encoding: 'utf8' });
        JSON.parse(contents);
        return contents;
      } catch (err) {
        // file not ready yet (missing, empty, or partially written)
      }
      await new Promise(resolve => setImmediate(resolve));
    }
    throw new Error(`Timed out waiting for log file to be written: ${path}`);
  };

  process.emit('uncaughtException', expectedMessage);

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const contents = await waitForLogFileToBeWritten(filePath);
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});