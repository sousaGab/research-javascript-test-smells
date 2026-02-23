describe('custom levels', () => {
  const ALL_LOGGER_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug'];

  const CONSOLE_METHODS_MAP = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug',
  };

  const testCases = [{
    level: 'error',
    shouldCall: ['error']
  }, {
    level: 'warn',
    shouldCall: ['error', 'warn']
  }, {
    level: 'info',
    shouldCall: ['error', 'warn', 'info']
  }, {
    level: 'verbose',
    shouldCall: ['error', 'warn', 'info', 'verbose']
  }, {
    level: 'debug',
    shouldCall: ['error', 'warn', 'info', 'verbose', 'debug']
  }, ];

  test.each(testCases)(
    'when level is $level, it should only log messages for that level and above',
    ({
      level,
      shouldCall
    }) => {
      // Arrange
      const logger = serverlessExpressLogger({
        level
      });
      const callsByConsoleMethod = {};

      // Act
      ALL_LOGGER_LEVELS.forEach(logLevel => {
        logger[logLevel](`${logLevel} message`);

        const consoleMethod = CONSOLE_METHODS_MAP[logLevel];
        if (!callsByConsoleMethod[consoleMethod]) {
          callsByConsoleMethod[consoleMethod] = {
            should: [],
            shouldNot: []
          };
        }

        const message = {
          message: `${logLevel} message`
        };
        if (shouldCall.includes(logLevel)) {
          callsByConsoleMethod[consoleMethod].should.push(message);
        } else {
          callsByConsoleMethod[consoleMethod].shouldNot.push(message);
        }
      });

      // Assert
      Object.entries(callsByConsoleMethod).forEach(([consoleMethod, {
        should,
        shouldNot
      }]) => {
        const consoleMock = global.console[consoleMethod];

        expect(consoleMock).toHaveBeenCalledTimes(should.length);

        should.forEach(arg => {
          expect(consoleMock).toHaveBeenCalledWith(arg);
        });

        shouldNot.forEach(arg => {
          expect(consoleMock).not.toHaveBeenCalledWith(arg);
        });
      });
    }
  );
});