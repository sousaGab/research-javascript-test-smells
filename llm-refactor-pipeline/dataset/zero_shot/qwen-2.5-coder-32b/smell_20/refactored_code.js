it('with a custom winston.Logger instance', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
          const expectedExitCode = 1;
          const delayMilliseconds = 500;
          const expectedLogPrefix = 'uncaughtException: ';

          process.emit('uncaughtException', expectedMessage);
          await new Promise(resolve => setTimeout(resolve, delayMilliseconds));

          expect(processExitSpy).toHaveBeenCalledTimes(1);
          expect(processExitSpy).toHaveBeenCalledWith(expectedExitCode);

          // Read the log file and verify its contents
          const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
          const data = JSON.parse(contents);

          // Assert on the log data
          assume(data).is.an('object');
          helpers.assertProcessInfo(data.process);
          helpers.assertOsInfo(data.os);
          helpers.assertTrace(data.trace);
          assume(data.message).includes(expectedLogPrefix + expectedMessage);
        })