it('with a custom winston.Logger instance', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const logData = [];

  // Mock the logger to capture log data
  const originalWrite = process.stdout.write;
  process.stdout.write = (chunk) => {
    logData.push(chunk);
    return true;
  };

  const originalError = console.error;
  console.error = (chunk) => {
    logData.push(chunk);
  };

  // Spy on process.exit to verify it's called
  const originalExit = process.exit;
  process.exit = (code) => {
    processExitSpy(code);
    return undefined;
  };

  // Emit the uncaught exception
  process.emit('uncaughtException', expectedMessage);

  // Restore original functions after a short delay to allow async handling
  await new Promise(resolve => setImmediate(resolve));

  // Restore original functions
  process.stdout.write = originalWrite;
  console.error = originalError;
  process.exit = originalExit;

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
});