it('with a custom winston.Logger instance', (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  // Listen for the log file to be written
  const watcher = fs.watch(filePath, async (eventType) => {
    if (eventType === 'change') {
      watcher.close();
      
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
      
      done();
    }
  });

  process.emit('uncaughtException', expectedMessage);
});