it('when strings are thrown as errors', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          // Use fake timers to control time-based behavior
          jest.useFakeTimers();

          process.emit('uncaughtException', expectedMessage);
          
          // Advance timers to flush the setTimeout
          jest.advanceTimersByTime(500);

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

          // Restore real timers
          jest.useRealTimers();
        })