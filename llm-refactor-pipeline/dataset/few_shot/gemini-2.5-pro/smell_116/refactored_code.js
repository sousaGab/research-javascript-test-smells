describe('custom levels', () => {
  const HIERARCHY = ['error', 'warn', 'info', 'verbose', 'debug'];
  const CONSOLE_MAP = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug'
  };

  const testCases = HIERARCHY.map((level, index) => ({
    level,
    activeMethods: HIERARCHY.slice(0, index + 1),
    inactiveMethods: HIERARCHY.slice(index + 1)
  }));

  test.each(testCases)(
    'when level is "$level", it should only log messages for active methods',
    ({
      level,
      activeMethods,
      inactiveMethods
    }) => {
      // Arrange
      const logger = serverlessExpressLogger({
        level
      });

      // Action
      HIERARCHY.forEach(method => {
        logger[method](`${method} message`);
      });

      // Assert
      activeMethods.forEach(method => {
        const consoleMethod = CONSOLE_MAP[method];
        expect(global.console[consoleMethod]).toHaveBeenCalledWith({
          message: `${method} message`
        });
      });

      inactiveMethods.forEach(method => {
        const consoleMethod = CONSOLE_MAP[method];
        expect(global.console[consoleMethod]).not.toHaveBeenCalledWith({
          message: `${method} message`
        });
      });
    }
  );
});