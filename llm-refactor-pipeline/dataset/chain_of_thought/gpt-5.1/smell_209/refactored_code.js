it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  const waitForLogAndExit = new Promise((resolve, reject) => {
    const originalExit = process.exit;

    const restoreExit = () => {
      process.exit = originalExit;
    };

    process.exit = (...args) => {
      try {
        processExitSpy(...args);
        restoreExit();
        resolve();
      } catch (err) {
        restoreExit();
        reject(err);
      }
    };
  });

  process.emit('uncaughtException', expectedMessage);
  await waitForLogAndExit;

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});