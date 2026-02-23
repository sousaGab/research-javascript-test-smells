const WAIT_TIMEOUT_MS = 500;
const EXPECTED_EXIT_CODE = 1;
const EXPECTED_CALL_TIMES = 1;
const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';

it('with the default winston logger', async () => {
        winston.exceptions.handle([
          new winston.transports.File({
            filename: filePath,
            handleExceptions: true
          })
        ]);

        process.emit('uncaughtException', EXPECTED_MESSAGE);
        await new Promise(resolve => setTimeout(resolve, WAIT_TIMEOUT_MS));

        expect(processExitSpy).toHaveBeenCalledTimes(EXPECTED_CALL_TIMES);
        expect(processExitSpy).toHaveBeenCalledWith(EXPECTED_EXIT_CODE);

        // Read the log file and verify its contents
        const contents = await fsPromise.readFile(filePath, { encoding: 'utf8' });
        const data = JSON.parse(contents);

        // Assert on the log data
        assume(data).is.an('object');
        helpers.assertProcessInfo(data.process);
        helpers.assertOsInfo(data.os);
        helpers.assertTrace(data.trace);
        assume(data.message).includes('uncaughtException: ' + EXPECTED_MESSAGE);
      })