it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const EXIT_CALL_COUNT = 1;
  const EXIT_CODE_FAILURE = 1;
  const WAIT_FOR_ASYNC_LOGGING_MS = 500;
  const FILE_ENCODING_UTF8 = 'utf8';
  const UNCAUGHT_EXCEPTION_PREFIX = 'uncaughtException: ';

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, WAIT_FOR_ASYNC_LOGGING_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXIT_CODE_FAILURE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: FILE_ENCODING_UTF8 });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes(UNCAUGHT_EXCEPTION_PREFIX + expectedMessage);
});