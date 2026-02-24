it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const logWritten = new Promise(resolve => {
    const checkLog = async () => {
      try {
        const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
        if (contents.trim()) {
          resolve(contents);
        } else {
          setTimeout(checkLog, 10);
        }
      } catch (error) {
        setTimeout(checkLog, 10);
      }
    };
    checkLog();
  });

  process.emit('uncaughtException', expectedMessage);
  const contents = await logWritten;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const data = JSON.parse(contents);
  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});