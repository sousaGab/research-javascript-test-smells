it('with the default winston logger', async () => {
  const EXPECTED_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const LOG_WRITE_DELAY_MS = 500;
  const UNCAUGHT_EXCEPTION_EXIT_CODE = 1;
  
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', EXPECTED_EXCEPTION_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, LOG_WRITE_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(UNCAUGHT_EXCEPTION_EXIT_CODE);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + EXPECTED_EXCEPTION_MESSAGE);
})