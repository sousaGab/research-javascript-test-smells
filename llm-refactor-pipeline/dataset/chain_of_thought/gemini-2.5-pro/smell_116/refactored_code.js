describe('custom levels', () => {
  const LOG_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug'];
  const CONSOLE_METHODS = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug'
  };

  const testCases = LOG_LEVELS.map((level, index) => ({
    level,
    shouldCall: LOG_LEVELS.slice(0, index + 1)
  }));

  test.each(testCases)(
    'when level is "$level", it should only log messages at that level or higher',
    ({
      level,
      shouldCall
    }) => {
      // Arrange
      const logger = serverlessExpressLogger({
        level
      });
      const calledConsoleMethods = new Set(shouldCall.map(lvl => CONSOLE_METHODS[lvl]));
      const allConsoleMethods = new Set(Object.values(CONSOLE_METHODS));
      const notCalledConsoleMethods = [...allConsoleMethods].filter(
        method => !calledConsoleMethods.has(method)
      );

      // Act
      LOG_LEVELS.forEach(logLevelToCall => {
        logger[logLevelToCall](logLevelToCall);
      });

      // Assert which methods were called
      shouldCall.forEach(logLevel => {
        const consoleMethod = CONSOLE_METHODS[logLevel];
        expect(global.console[consoleMethod]).toHaveBeenCalledWith({
          message: logLevel
        });
      });

      // Assert which methods were not called
      notCalledConsoleMethods.forEach(consoleMethod => {
        expect(global.console[consoleMethod]).not.toHaveBeenCalled();
      });
    }
  );
});