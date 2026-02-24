it('with the default winston logger', async () => {
  const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
  winston.exceptions.handle([
    new winston.transports.File({
      filename: filePath,
      handleExceptions: true
    })
  ]);

  process.emit('uncaughtException', expectedMessage);

  // Wait for process exit to be called
  await new Promise((resolve) => {
    const checkExitCall = () => {
      if (processExitSpy.mock.calls.length > 0) {
        resolve();
      } else {
        setTimeout(checkExitCall, 10);
      }
    };
    checkExitCall();
  });

  expect(processExitSpy).toHaveBeenCalledTimes(1);
  expect(processExitSpy).toHaveBeenCalledWith(1);

  // Wait for file to be written with retry logic
  let contents;
  let retries = 0;
  const maxRetries = 50;
  
  while (retries < maxRetries) {
    try {
      contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
      break;
    } catch (error) {
      if (error.code === 'ENOENT') {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 10));
      } else {
        throw error;
      }
    }
  }

  if (!contents) {
    throw new Error('Log file was not created within expected time');
  }

  const data = JSON.parse(contents);

  assume(data).is.an('object');
  helpers.assertProcessInfo(data.process);
  helpers.assertOsInfo(data.os);
  helpers.assertTrace(data.trace);
  assume(data.message).includes('uncaughtException: ' + expectedMessage);
});