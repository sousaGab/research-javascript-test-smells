it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  const levelEnabledMethods = {
    isLevelEnabled: 'function',
    isErrorEnabled: 'function',
    isWarnEnabled: 'function',
    isInfoEnabled: 'function',
    isVerboseEnabled: 'function',
    isDebugEnabled: 'function',
    isSillyEnabled: 'function'
  };

  Object.entries(levelEnabledMethods).forEach(([method, type]) => {
    assume(logger[method]).is.a(type);
  });

  const expectedByLevel = {
    error: true,
    warn: true,
    info: true,
    verbose: true,
    debug: false,
    silly: false
  };

  Object.entries(expectedByLevel).forEach(([level, expected]) => {
    assume(logger.isLevelEnabled(level)).equals(expected);
  });

  const expectedByMethod = {
    isErrorEnabled: true,
    isWarnEnabled: true,
    isInfoEnabled: true,
    isVerboseEnabled: true,
    isDebugEnabled: false,
    isSillyEnabled: false
  };

  Object.entries(expectedByMethod).forEach(([method, expected]) => {
    assume(logger[method]()).equals(expected);
  });
});