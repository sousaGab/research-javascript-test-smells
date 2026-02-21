const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
const PROCESS_EXIT_CODE = 1;
const FILE_PATH = 'path/to/log/file';

it('when strings are thrown as errors', async () => {
  process.emit('uncaughtException', EXPECTED_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, 500));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(FILE_PATH, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + EXPECTED_MESSAGE);
})