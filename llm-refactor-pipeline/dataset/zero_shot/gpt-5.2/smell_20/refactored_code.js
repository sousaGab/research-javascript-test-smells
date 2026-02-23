it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const PROCESS_EXIT_CALLS = 1;
  const PROCESS_EXIT_CODE_FAILURE = 1;
  const ASYNC_LOG_FLUSH_DELAY_MS = 500;

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, ASYNC_LOG_FLUSH_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(PROCESS_EXIT_CALLS);
  expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_CODE_FAILURE);

  // Read the log file and verify its contents
  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});