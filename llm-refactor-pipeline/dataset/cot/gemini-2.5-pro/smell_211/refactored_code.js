it('with a custom winston.Logger instance', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          const exitCalled = new Promise(resolve => {
            // The spy is likely set up in a beforeEach block. We can redefine its
            // implementation here to resolve the promise when the handler calls process.exit.
            processExitSpy.mockImplementation(resolve);
          });

          process.emit('uncaughtException', expectedMessage);

          // Wait for the process.exit mock to be called, which signals the async logging is complete.
          await exitCalled;

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