it('when strings are thrown as errors', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

          process.emit('uncaughtException', expectedMessage);

          // Wait for the async operation to complete using a more reliable approach
          // Since we can't easily mock the internal async behavior, we'll use a reasonable timeout
          // that's much smaller than the original 500ms but still allows for processing
          await new Promise(resolve => setTimeout(resolve, 10));

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