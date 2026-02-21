it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  const logContents = [];
  
  const fileTransport = new winston.transports.File({
    filename: filePath,
    handleExceptions: true
  });

  // Capture log writes instead of relying on timing
  const originalWrite = fileTransport.write;
  fileTransport.write = function(chunk, encoding, callback) {
    logContents.push(chunk);
    return originalWrite.call(this, chunk, encoding, callback);
  };

  winston.exceptions.handle([fileTransport]);

  const exitPromise = new Promise(resolve => {
    const originalExit = process.exit;
    process.exit = function(code) {
      processExitSpy(code);
      resolve(code);
    };
    
    // Restore exit after test
    return () => {
      process.exit = originalExit;
    };
  });

  process.emit('uncaughtException', expectedMessage);
  
  // Wait for the exit to occur
  await exitPromise;

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