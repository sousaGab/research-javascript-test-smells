it('default levels', function () {
  let logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  const levelChecks = [
    { method: 'isErrorEnabled', level: 'error', expected: true },
    { method: 'isWarnEnabled', level: 'warn', expected: true },
    { method: 'isInfoEnabled', level: 'info', expected: true },
    { method: 'isVerboseEnabled', level: 'verbose', expected: true },
    { method: 'isDebugEnabled', level: 'debug', expected: false },
    { method: 'isSillyEnabled', level: 'silly', expected: false }
  ];

  levelChecks.forEach(({ method, level, expected }) => {
    assume(logger[method]).is.a('function');
    assume(logger.isLevelEnabled(level)).equals(expected);
    assume(logger[method]()).equals(expected);
  });
});