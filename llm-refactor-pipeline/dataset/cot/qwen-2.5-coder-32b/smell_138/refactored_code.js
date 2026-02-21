it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const exitCallback = jest.fn();

  // Mock process.exit to capture the call
  const originalExit = process.exit;
  process.exit = exitCallback;

  // Mock fs.writeFile to capture log contents
  const writeFileSpy = jest.spyOn(fsPromise, 'writeFile');

  process.emit('uncaughtException', expectedMessage);

  // Wait for the async operation to complete
  await new Promise(setImmediate);

  // Restore original process.exit
  process.exit = originalExit;

  expect(exitCallback).toHaveBeenCalledTimes(1);
  expect(exitCallback).toHaveBeenCalledWith(1);

  // Verify the log was written
  expect(writeFileSpy).toHaveBeenCalled();
  const logContent = writeFileSpy.mock.calls[0][1];
  const data = JSON.parse(logContent);

  // Assert on the log data
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);

  writeFileSpy.mockRestore();
});