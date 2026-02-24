it('with a custom winston.Logger instance', (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  const onUncaughtException = async () => {
    try {
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
    } catch (error) {
      done(error);
    } finally {
      process.removeListener('uncaughtException', onUncaughtException);
    }
  };

  process.once('uncaughtException', onUncaughtException);
  process.emit('uncaughtException', expectedMessage);
});