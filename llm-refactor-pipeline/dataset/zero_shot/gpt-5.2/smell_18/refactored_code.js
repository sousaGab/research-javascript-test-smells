it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const EXIT_CALL_COUNT = 1;
  const EXIT_CODE_FAILURE = 1;
  const LOG_FLUSH_DELAY_MS = 500;

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, LOG_FLUSH_DELAY_MS));

  expect(processExitSpy).toHaveBeenCalledTimes(EXIT_CALL_COUNT);
  expect(processExitSpy).toHaveBeenCalledWith(EXIT_CODE_FAILURE);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});