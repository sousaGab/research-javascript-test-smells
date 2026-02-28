// Your COMPLETE refactored test code here
it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const PROCESS_EXIT_CALL_COUNT = 1;
  const EXPECTED_EXIT_CODE = 1;
  const LOG_FLUSH_DELAY_MS = 500;
  const FILE_ENCODING = 'utf8';
  const UNCAUGHT_EXCEPTION_PREFIX = 'uncaughtException: ';

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, LOG_FLUSH_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(PROCESS_EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: FILE_ENCODING });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes(UNCAUGHT_EXCEPTION_PREFIX + expectedMessage);
});