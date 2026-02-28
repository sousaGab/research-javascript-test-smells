const UNCAUGHT_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
const PROCESS_EXIT_DELAY_MS = 500;
const EXPECTED_EXIT_CODE = 1;
const EXPECTED_PROCESS_EXIT_CALLS = 1;

it('with a custom winston.Logger instance', async () => {
  process.emit('uncaughtException', UNCAUGHT_EXCEPTION_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, PROCESS_EXIT_DELAY_MS));

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
  assume(data.message).includes('uncaughtException: ' + UNCAUGHT_EXCEPTION_MESSAGE);
});