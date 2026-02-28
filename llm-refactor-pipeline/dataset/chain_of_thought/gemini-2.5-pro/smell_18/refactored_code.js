it('when strings are thrown as errors', async () => {
          const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
          const ASYNC_COMPLETION_DELAY_MS = 500;
          const FAILURE_EXIT_CODE = 1;
          const UNCAUGHT_EXCEPTION_LOG_PREFIX = 'uncaughtException: ';

          process.emit('uncaughtException', expectedMessage);
          await new Promise(resolve => setTimeout(resolve, ASYNC_COMPLETION_DELAY_MS));

          expect(processExitSpy).toHaveBeenCalledTimes(1);
          expect(processExitSpy).toHaveBeenCalledWith(FAILURE_EXIT_CODE);

          // Read the log file and verify its contents
          const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
          const data = JSON.parse(contents);

          // Assert on the log data
          assume(data).is.an('object');
          helpers.assertProcessInfo(data.process);
          helpers.assertOsInfo(data.os);
          helpers.assertTrace(data.trace);
          assume(data.message).includes(UNCAUGHT_EXCEPTION_LOG_PREFIX + expectedMessage);
        })