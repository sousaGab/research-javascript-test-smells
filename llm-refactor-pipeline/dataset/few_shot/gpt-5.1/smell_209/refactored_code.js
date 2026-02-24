it('with the default winston logger', (done) => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const onExit = async (code) => {
    try {
      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith(1);

      const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
      const data = JSON.parse(contents);

      assume(data).is.an('object');
      helpers.assertProcessInfo(data.process);
      helpers.assertOsInfo(data.os);
      helpers.assertTrace(data.trace);
      assume(data.message).includes('uncaughtException: ' + expectedMessage);

      done();
    } catch (error) {
      done(error);
    } finally {
      processExitSpy.mockRestore && processExitSpy.mockRestore();
      process.removeListener('exit', onExit);
    }
  };

  process.on('exit', onExit);
  process.emit('uncaughtException', expectedMessage);
});