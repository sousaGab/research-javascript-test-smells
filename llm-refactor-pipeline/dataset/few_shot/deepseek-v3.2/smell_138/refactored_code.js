it('when strings are thrown as errors', (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  // Listen for the process exit event instead of waiting
  processExitSpy.mockImplementation(() => {
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
  });

  process.emit('uncaughtException', expectedMessage);
});