// Your COMPLETE refactored test code here

it('with the default winston logger', async () => {
    const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
    winston.exceptions.handle([
      new winston.transports.File({
        filename: filePath,
        handleExceptions: true
      })
    ]);

    process.emit('uncaughtException', expectedMessage);

    // Read the log file and verify its contents
    const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
    const data = JSON.parse(contents);

    // Assert on the log data
    assume(data).is.an('object');
    helpers.assertProcessInfo(data.process);
    helpers.assertOsInfo(data.os);
    helpers.assertTrace(data.trace);
    assume(data.message).includes('uncaughtException: ' + expectedMessage);
  })