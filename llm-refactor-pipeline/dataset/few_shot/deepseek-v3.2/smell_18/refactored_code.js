it('when strings are thrown as errors', async () => {
  const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const EXPECTED_EXIT_CODE = 1;
  const WAIT_TIME_MS = 500;
  const EXPECTED_EXIT_CALL_COUNT = 1;

  process.emit('uncaughtException', EXPECTED_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + EXPECTED_MESSAGE);
})