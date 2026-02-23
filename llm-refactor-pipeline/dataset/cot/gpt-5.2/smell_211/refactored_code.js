// Your COMPLETE refactored test code here
it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  // Wait deterministically for the side-effect (process.exit) instead of sleeping.
  const exitCalled = new Promise((resolve, reject) => {
    try {
      processExitSpy.mockImplementation((code) => resolve(code));
    } catch (e) {
      reject(e);
    }
  });

  process.emit('uncaughtException', expectedMessage);

  const exitCode = await exitCalled;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);
  expect(exitCode).toBe(1);

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