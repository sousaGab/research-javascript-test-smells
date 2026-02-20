const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
const PROCESS_EXIT_CODE = 1;
const DELAY_TIME = 500;

it('with a custom winston.Logger instance', async () => {
  const expectedMessage = EXPECTED_MESSAGE;

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, DELAY_TIME));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_CODE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
})