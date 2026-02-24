it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  const levelMethods = [
    'isErrorEnabled',
    'isWarnEnabled',
    'isInfoEnabled',
    'isVerboseEnabled',
    'isDebugEnabled',
    'isSillyEnabled'
  ];

  levelMethods.forEach(method => {
    assume(logger[method]).is.a('function');
  });

  const levelExpectations = {
    error: true,
    warn: true,
    info: true,
    verbose: true,
    debug: false,
    silly: false
  };

  Object.entries(levelExpectations).forEach(([level, expected]) => {
    assume(logger.isLevelEnabled(level))[expected ? 'true' : 'false']();
  });

  Object.entries(levelExpectations).forEach(([level, expected]) => {
    const methodName = `is${level.charAt(0).toUpperCase()}${level.slice(1)}Enabled`;
    assume(logger[methodName]())[expected ? 'true' : 'false']();
  });
});