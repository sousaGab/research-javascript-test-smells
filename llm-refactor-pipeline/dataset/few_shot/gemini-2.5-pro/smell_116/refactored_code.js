test('custom levels', () => {
  const ALL_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug'];

  const CONSOLE_MAPPING = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug'
  };

  const testCases = [{
    level: 'error',
    shouldLog: ['error']
  }, {
    level: 'warn',
    shouldLog: ['error', 'warn']
  }, {
    level: 'info',
    shouldLog: ['error', 'warn', 'info']
  }, {
    level: 'verbose',
    shouldLog: ['error', 'warn', 'info', 'verbose']
  }, {
    level: 'debug',
    shouldLog: ['error', 'warn', 'info', 'verbose', 'debug']
  }, ];

  test.each(testCases)(
    'when level is "$level", it only logs messages at or above that level',
    ({
      level,
      shouldLog
    }) => {
      const logger = serverlessExpressLogger({
        level
      });

      // Act: call all logger methods with a unique message
      ALL_LEVELS.forEach(logLevel => {
        logger[logLevel](`${logLevel} message`);
      });

      // Assert
      ALL_LEVELS.forEach(logLevel => {
        const consoleMethod = CONSOLE_MAPPING[logLevel];
        const expectedMessage = {
          message: `${logLevel} message`
        };

        if (shouldLog.includes(logLevel)) {
          // Assert it was called with the correct message
          expect(global.console[consoleMethod]).toHaveBeenCalledWith(expectedMessage);
        } else {
          // Assert it was NOT called with this specific message
          expect(global.console[consoleMethod]).not.toHaveBeenCalledWith(expectedMessage);
        }
      });
    }
  );
});