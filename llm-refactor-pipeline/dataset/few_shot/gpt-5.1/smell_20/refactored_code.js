it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const EXPECTED_EXIT_CALL_COUNT = 1;
  const EXPECTED_EXIT_CODE = 1;
  const WAIT_FOR_LOG_WRITE_MS = 500;
  const FILE_ENCODING = 'utf8';

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, WAIT_FOR_LOG_WRITE_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: FILE_ENCODING });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});