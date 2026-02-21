it('when strings are thrown as errors', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
          const logData = [];

          // Mock the file system write operation to capture log data
          const originalWriteFile = fsPromise.writeFile;
          fsPromise.writeFile = jest.fn().mockImplementation((filePath, data) => {
            logData.push(JSON.parse(data));
            return Promise.resolve();
          });

          // Mock console.error to capture error output
          const originalConsoleError = console.error;
          const consoleErrorMock = jest.fn();
          console.error = consoleErrorMock;

          process.emit('uncaughtException', expectedMessage);

          // Wait for the process to exit by mocking process.exit
          const originalExit = process.exit;
          process.exit = jest.fn();

          // Allow the event loop to process
          await new Promise(resolve => setImmediate(resolve));

          // Restore original implementations
          process.exit = originalExit;
          console.error = originalConsoleError;
          fsPromise.writeFile = originalWriteFile;

          expect(processExitSpy).toHaveBeenCalledTimes(1);
          expect(processExitSpy).toHaveBeenCalledWith(1);

          // Verify the captured log data
          expect(logData.length).toBe(1);
          const data = logData[0];
          assume(data).is.an('object');
          helpers.assertProcessInfo(data.process);
          helpers.assertOsInfo(data.os);
          helpers.assertTrace(data.trace);
          assume(data.message).includes('uncaughtException: ' + expectedMessage);
        })