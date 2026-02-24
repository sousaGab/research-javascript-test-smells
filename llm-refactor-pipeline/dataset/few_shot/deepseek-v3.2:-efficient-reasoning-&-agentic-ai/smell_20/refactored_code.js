it('with a custom winston.Logger instance', async () => {
  const EXPECTED_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWAWFUL';
  const WAIT_TIME_MS = 500;
  const EXPECTED_EXIT_CODE = 1;
  const EXPECTED_PROCESS_EXIT_CALLS = 1;

  process.emit('uncaughtException', EXPECTED_EXCEPTION_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_PROCESS_EXIT_CALLS);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + EXPECTED_EXCEPTION_MESSAGE);
})