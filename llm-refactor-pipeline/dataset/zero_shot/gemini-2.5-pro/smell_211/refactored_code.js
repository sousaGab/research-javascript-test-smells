it('with a custom winston.Logger instance', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          // Create a promise that resolves when the logger has finished writing to its transports.
          // This assumes the `logger` instance is in scope for the test.
          const logFinished = new Promise(resolve => logger.on('finish', resolve));

          process.emit('uncaughtException', expectedMessage);

          // Wait for the asynchronous log operation to complete before proceeding.
          await logFinished;

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
        })