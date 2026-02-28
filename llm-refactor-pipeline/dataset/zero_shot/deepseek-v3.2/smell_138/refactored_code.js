it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  process.emit('uncaughtException', expectedMessage);
  
  // Wait for process.exit to be called instead of using fixed delay
  await new Promise(resolve => {
    const checkCall = () => {
      if (processExitSpy.mock.calls.length > 0) {
        resolve();
      } else {
        setTimeout(checkCall, 10);
      }
    };
    checkCall();
  });

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

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