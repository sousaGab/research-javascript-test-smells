it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const PROCESS_EXIT_ERROR_CODE = 1;
  const EXPECTED_PROCESS_EXIT_CALLS = 1;
  const LOG_FLUSH_WAIT_MS = 500;

  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, LOG_FLUSH_WAIT_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_PROCESS_EXIT_CALLS);
  expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_ERROR_CODE);

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