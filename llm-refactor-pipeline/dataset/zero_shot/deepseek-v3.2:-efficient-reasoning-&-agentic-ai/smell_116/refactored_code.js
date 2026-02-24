test('custom levels', () => {
  const levels = ['error', 'warn', 'info', 'verbose', 'debug'];
  const testCases = [
    {
      level: 'error',
      calls: ['error'],
      nocalls: ['info', 'warn', 'debug', 'verbose']
    },
    {
      level: 'warn',
      calls: ['error', 'warn'],
      nocalls: ['info', 'debug', 'verbose']
    },
    {
      level: 'info',
      calls: ['error', 'warn', 'info'],
      nocalls: ['debug', 'verbose']
    },
    {
      level: 'verbose',
      calls: ['error', 'warn', 'info', 'verbose'],
      nocalls: ['debug']
    },
    {
      level: 'debug',
      calls: ['error', 'warn', 'info', 'verbose', 'debug'],
      nocalls: []
    }
  ];

  testCases.forEach((testCase, index) => {
    const logger = serverlessExpressLogger({ level: testCase.level });
    const testNumber = index + 1;

    testCase.calls.forEach(method => {
      const message = `${method}${testNumber}`;
      logger[method](message);
      expect(global.console[method]).toHaveBeenLastCalledWith({
        message
      });
    });

    testCase.nocalls.forEach(method => {
      logger[method](`nocall`);
      expect(global.console[method]).not.toHaveBeenCalled();
    });
  });
});