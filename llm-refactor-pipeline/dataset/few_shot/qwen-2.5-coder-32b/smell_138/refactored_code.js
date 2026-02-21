it('when strings are thrown as errors', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const logData = [];

  // Mock the logging mechanism to capture data
  const originalWriteFileSync = require('fs').writeFileSync;
  require('fs').writeFileSync = (path, data) => {
    logData.push(JSON.parse(data));
  };

  // Mock process.exit to prevent actual exit
  const originalExit = process.exit;
  process.exit = (code) => {
    // Simulate what would happen on exit
    const lastLog = logData[logData.length - 1];
    if (lastLog && lastLog.message.includes('uncaughtException: ' + expectedMessage)) {
      // Exit logic would be handled here
    }
  };

  try {
    process.emit('uncaughtException', expectedMessage);
    
    // Wait for the logging to complete
    await new Promise(resolve => setImmediate(resolve));
    
    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    // Verify log contents
    const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
    const data = JSON.parse(contents);

    assume(data).is.an('object');
    helpers.assertProcessInfo(data.process);
    helpers.assertOsInfo(data.os);
    helpers.assertTrace(data.trace);
    assume(data.message).includes('uncaughtException: ' + expectedMessage);
  } finally {
    // Restore original functions
    require('fs').writeFileSync = originalWriteFileSync;
    process.exit = originalExit;
  }
});