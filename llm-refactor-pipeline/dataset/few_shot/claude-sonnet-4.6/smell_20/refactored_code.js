const WAIT_TIMEOUT_MS = 500;
const EXPECTED_EXIT_CODE = 1;
const EXPECTED_CALL_TIMES = 1;
const EXPECTED_MESSAGE = 'OMG NEVER DO THIS STRING EXCEPTIONS ARE AWFUL';
const EXPECTED_LOG_PREFIX = 'uncaughtException: ';

it('with a custom winston.Logger instance', async () => {
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
          assume(data.message).includes(EXPECTED_LOG_PREFIX + EXPECTED_MESSAGE);
        })