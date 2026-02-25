test('custom levels', () => {
  const testCases = [{
    level: 'error',
    expectedCalls: ['error']
  }, {
    level: 'warn',
    expectedCalls: ['error', 'warn']
  }, {
    level: 'info',
    expectedCalls: ['error', 'warn', 'info']
  }, {
    level: 'verbose',
    expectedCalls: ['error', 'warn', 'info', 'verbose']
  }, {
    level: 'debug',
    expectedCalls: ['error', 'warn', 'info', 'verbose', 'debug']
  }, ];

  const consoleMethodMap = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'debug',
    debug: 'debug'
  };

  const allLoggerMethods = Object.keys(consoleMethodMap);
  const allConsoleMethods = [...new Set(Object.values(consoleMethodMap))];

  testCases.forEach(({
    level,
    expectedCalls
  }) => {
    jest.clearAllMocks();

    const logger = serverlessExpressLogger({
      level
    });

    allLoggerMethods.forEach(methodName => {
      logger[methodName](`${methodName} message`);
    });

    const expectedConsoleMethods = new Set();

    expectedCalls.forEach(methodName => {
      const consoleMethod = consoleMethodMap[methodName];
      expectedConsoleMethods.add(consoleMethod);
      expect(global.console[consoleMethod]).toHaveBeenCalledWith({
        message: `${methodName} message`
      });
    });

    allConsoleMethods.forEach(consoleMethod => {
      if (!expectedConsoleMethods.has(consoleMethod)) {
        expect(global.console[consoleMethod]).not.toHaveBeenCalled();
      }
    });
  });
});