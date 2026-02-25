it('with the default winston logger', async () => {
        const expectedMessage = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const LOG_WRITE_DELAY_MS = 500;
        const EXPECTED_CALL_COUNT = 1;
        const FAILURE_EXIT_CODE = 1;

        winston.exceptions.handle([
          new winston.transports.File({
            filename: filePath,
            handleExceptions: true
          })
        ]);

        process.emit('uncaughtException', expectedMessage);
        await new Promise(resolve => setTimeout(resolve, LOG_WRITE_DELAY_MS));

        expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_CALL_COUNT);
        expect(processExitSpy).toHaveBeenCalledWith(FAILURE_EXIT_CODE);

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