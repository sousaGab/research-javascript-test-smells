it('with a custom winston.Logger instance', async (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  
  const exitHandler = (code) => {
    process.removeListener('exit', exitHandler);
    
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

  process.on('exit', exitHandler);
  process.emit('uncaughtException', expectedMessage);
});