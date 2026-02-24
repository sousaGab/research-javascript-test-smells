it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  const levelChecks = [
    { level: 'error', enabled: true },
    { level: 'warn', enabled: true },
    { level: 'info', enabled: true },
    { level: 'verbose', enabled: true },
    { level: 'debug', enabled: false },
    { level: 'silly', enabled: false }
  ];

  const levelMethods = {
    error: 'isErrorEnabled',
    warn: 'isWarnEnabled',
    info: 'isInfoEnabled',
    verbose: 'isVerboseEnabled',
    debug: 'isDebugEnabled',
    silly: 'isSillyEnabled'
  };

  levelChecks.forEach(({ level, enabled }) => {
    const methodName = levelMethods[level];

    assume(logger[methodName]).is.a('function');
    assume(logger.isLevelEnabled(level))[enabled ? 'true' : 'false']();
    assume(logger[methodName]())[enabled ? 'true' : 'false']();
  });
});