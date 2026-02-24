it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const expectedExitCode = 1;
  const expectedExitCallCount = 1;
  const logProcessingDelayMs = 500;

  process.emit('uncaughtException', expectedMessage);
  await new Promise(resolve => setTimeout(resolve, logProcessingDelayMs));

  expect(processExitSpy).toHaveBeenCalledTimes(expectedExitCallCount);
  expect(processExitSpy).toHaveBeenCalledWith(expectedExitCode);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
})