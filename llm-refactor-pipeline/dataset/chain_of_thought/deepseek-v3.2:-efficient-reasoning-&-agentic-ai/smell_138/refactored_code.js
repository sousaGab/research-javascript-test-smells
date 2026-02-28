it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  // Create a promise that resolves when processExitSpy is called
  const exitPromise = new Promise(resolve => {
    const originalCall = processExitSpy.mock.calls.length;
    const checkExit = () => {
      if (processExitSpy.mock.calls.length > originalCall) {
        resolve();
      } else {
        setTimeout(checkExit, 10);
      }
    };
    checkExit();
  });

  process.emit('uncaughtException', expectedMessage);
  await exitPromise;

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