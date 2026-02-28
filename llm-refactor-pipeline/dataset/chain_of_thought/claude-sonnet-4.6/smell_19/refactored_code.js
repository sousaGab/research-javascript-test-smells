const EXPECTED_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
const EXCEPTION_HANDLER_DELAY_MS = 500;
const EXPECTED_PROCESS_EXIT_CODE = 1;
const EXPECTED_CALL_COUNT = 1;

it('with the default winston logger', async () => {
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', EXPECTED_EXCEPTION_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, EXCEPTION_HANDLER_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_PROCESS_EXIT_CODE);

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