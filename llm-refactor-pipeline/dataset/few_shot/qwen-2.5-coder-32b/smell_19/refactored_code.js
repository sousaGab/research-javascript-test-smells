it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const FILE_PATH = filePath;
  const PROCESS_EXIT_CODE = 1;
  const TIMEOUT_DELAY = 500;
  const EXPECTED_LOG_PREFIX = 'uncaughtException: ';

  winston.exceptions.handle([
    new winston.transports.File({
      filename: FILE_PATH,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, TIMEOUT_DELAY));

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
  assume(data.message).includes(EXPECTED_LOG_PREFIX + expectedMessage);
});