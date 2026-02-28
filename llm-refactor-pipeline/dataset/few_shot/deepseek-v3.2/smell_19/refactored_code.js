it('with the default winston logger', async () => {
  const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const FILE_READ_DELAY_MS = 500;
  const EXPECTED_EXIT_CODE = 1;
  const EXPECTED_EXIT_CALLS = 1;
  
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', EXPECTED_MESSAGE);
  await new Promise(resolve => setTimeout(resolve, FILE_READ_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_EXIT_CALLS);
  expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + EXPECTED_MESSAGE);
});