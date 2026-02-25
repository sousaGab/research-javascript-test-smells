it('with a custom winston.Logger instance', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          const onExit = new Promise(resolve => {
            // Replace the spy's implementation to resolve the promise when called.
            // This acts as a signal that the asynchronous logging has completed.
            processExitSpy.mockImplementation(resolve);
          });

          process.emit('uncaughtException', expectedMessage);

          // Wait for the process.exit spy to be called by the exception handler.
          await onExit;

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