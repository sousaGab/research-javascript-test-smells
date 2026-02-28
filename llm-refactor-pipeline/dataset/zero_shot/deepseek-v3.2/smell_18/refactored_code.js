it('when strings are thrown as errors', async () => {
  const ERROR_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const ERROR_HANDLING_DELAY_MS = 500;
  const EXPECTED_EXIT_CODE = 1;
  const EXPECTED_EXIT_CALL_COUNT = 1;
  const LOG_MESSAGE_PREFIX = 'uncaughtException: ';

  process.emit('uncaughtException', ERROR_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, ERROR_HANDLING_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes(LOG_MESSAGE_PREFIX + ERROR_MESSAGE);
})