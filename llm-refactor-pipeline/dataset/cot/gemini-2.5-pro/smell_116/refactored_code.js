describe('custom levels', () => {
  const loggerMethods = ['error', 'warn', 'info', 'verbose', 'debug'];
  const consoleMethodMap = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug'
  };

  const testCases = [
    { level: 'error', shouldLog: ['error'] },
    { level: 'warn', shouldLog: ['error', 'warn'] },
    { level: 'info', shouldLog: ['error', 'warn', 'info'] },
    { level: 'verbose', shouldLog: ['error', 'warn', 'info', 'verbose'] },
    { level: 'debug', shouldLog: ['error', 'warn', 'info', 'verbose', 'debug'] }
  ];

  test.each(testCases)(
    'when level is "$level", it should only log messages at that level or higher',
    ({ level, shouldLog }) => {
      const logger = serverlessExpressLogger({ level });

      loggerMethods.forEach(method => {
        logger[method](`${method} message`);
      });

      const shouldNotLog = loggerMethods.filter(method => !shouldLog.includes(method));

      shouldLog.forEach(method => {
        const consoleMethod = consoleMethodMap[method];
        expect(global.console[consoleMethod]).toHaveBeenCalledWith({
          message: `${method} message`
        });
      });

      // Group assertions for console methods that should not have been called
      const uncalledConsoleMethods = new Set();
      shouldNotLog.forEach(method => {
        const consoleMethod = consoleMethodMap[method];
        // Avoid re-checking a console method if multiple logger methods map to it
        if (!shouldLog.some(logMethod => consoleMethodMap[logMethod] === consoleMethod)) {
          uncalledConsoleMethods.add(consoleMethod);
        }
      });

      uncalledConsoleMethods.forEach(consoleMethod => {
        expect(global.console[consoleMethod]).not.toHaveBeenCalled();
      });
    }
  );
});