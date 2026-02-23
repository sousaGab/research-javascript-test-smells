it('with a custom winston.Logger instance', async () => {
  const ASYNC_WAIT_TIMEOUT_MS = 500;
  const UNCAUGHT_EXCEPTION_EXIT_CODE = 1;
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, ASYNC_WAIT_TIMEOUT_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EXIT_CODE);

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