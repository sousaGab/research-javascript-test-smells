it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const exitCalled = new Promise(resolve => {
    // The call to process.exit() signals that the async file logging is complete.
    // We can use the spy to resolve a promise and await it.
    processExitSpy.mockImplementation(resolve);
  });

  process.emit('uncaughtException', expectedMessage);

  // Wait for the exception handler to call process.exit()
  await exitCalled;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, {
    encoding: 'utf8'
  });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
})