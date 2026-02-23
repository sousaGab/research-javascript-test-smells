it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  const functionChecks = [
    'isLevelEnabled',
    'isErrorEnabled',
    'isWarnEnabled',
    'isInfoEnabled',
    'isVerboseEnabled',
    'isDebugEnabled',
    'isSillyEnabled'
  ];

  functionChecks.forEach((fn) => assume(logger[fn]).is.a('function'));

  const enabledByLevel = {
    error: true,
    warn: true,
    info: true,
    verbose: true,
    debug: false,
    silly: false
  };

  Object.keys(enabledByLevel).forEach((level) => {
    assume(logger.isLevelEnabled(level)).equals(enabledByLevel[level]);
  });

  const enabledByMethod = {
    isErrorEnabled: true,
    isWarnEnabled: true,
    isInfoEnabled: true,
    isVerboseEnabled: true,
    isDebugEnabled: false,
    isSillyEnabled: false
  };

  Object.keys(enabledByMethod).forEach((method) => {
    assume(logger[method]()).equals(enabledByMethod[method]);
  });
});