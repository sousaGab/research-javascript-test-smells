it('with the default winston logger', async () => {
        const EXPECTED_EXCEPTION_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
        const PROCESS_EXIT_CODE = 1;
        const LOG_FILE_READ_TIMEOUT = 500;
        const EXPECTED_LOG_MESSAGE_PREFIX = 'uncaughtException: ';

        winston.exceptions.handle([
          new winston.transports.File({
            filename: filePath,
            handleExceptions: true
          })
        ]);

        process.emit('uncaughtException', EXPECTED_EXCEPTION_MESSAGE);
        await new Promise(resolve => setTimeout(resolve, LOG_FILE_READ_TIMEOUT));

        expect(processExitSpy).toHaveBeenCalledTimes(1);
        expect(processExitSpy).toHaveBeenCalledWith(PROCESS_EXIT_CODE);

        // Read the log file and verify its contents
        const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
        const data = JSON.parse(contents);

        // Assert on the log data
        assume(data).is.an('object');
        helpers.assertProcessInfo(data.process);
        helpers.assertOsInfo(data.os);
        helpers.assertTrace(data.trace);
        assume(data.message).includes(EXPECTED_LOG_MESSAGE_PREFIX + EXPECTED_EXCEPTION_MESSAGE);
      })