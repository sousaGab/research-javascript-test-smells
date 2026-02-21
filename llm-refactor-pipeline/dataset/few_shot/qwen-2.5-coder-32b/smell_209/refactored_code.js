it('with the default winston logger', (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const exitHandler = () => {
    expect(processExitSpy).toHaveBeenCalledTimes(1);
    expect(processExitSpy).toHaveBeenCalledWith(1);

    // Read the log file and verify its contents
    fsPromise.readFile(filePath, { encoding: 'utf8' })
      .then(contents => {
        const data = JSON.parse(contents);

        // Assert on the log data
        assume(data).is.an('object');
        helpers.assertProcessInfo(data.process);
        helpers.assertOsInfo(data.os);
        helpers.assertTrace(data.trace);
        assume(data.message).includes('uncaughtException: ' + expectedMessage);
        
        done();
      })
      .catch(done);
  };

  // Mock the process.exit to avoid actual exit
  const originalExit = process.exit;
  process.exit = processExitSpy;

  // Set up listener for the exit event
  process.once('exit', exitHandler);

  // Emit the uncaught exception
  process.emit('uncaughtException', expectedMessage);

  // Restore original exit function
  process.exit = originalExit;
});