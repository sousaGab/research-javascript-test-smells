it('with a custom winston.Logger instance', async () => {
  const EXPECTED_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const PROCESS_EXIT_CODE_ON_UNCAUGHT_EXCEPTION = 1;
  const LOG_READ_DELAY_MS = 500;
  const UNCAUGHT_EXCEPTION_PREFIX = 'uncaughtException: ';

  process.emit('uncaughtException', EXPECTED_EXCEPTION_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, LOG_READ_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_CODE_ON_UNCAUGHT_EXCEPTION);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes(UNCAUGHT_EXCEPTION_PREFIX + EXPECTED_EXCEPTION_MESSAGE);
});