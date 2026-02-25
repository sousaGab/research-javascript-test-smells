it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  const levelChecks = {
    error: true,
    warn: true,
    info: true,
    verbose: true,
    debug: false,
    silly: false
  };

  Object.entries(levelChecks).forEach(([level, shouldBeEnabled]) => {
    const specificChecker = `is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`;

    assume(logger[specificChecker]).is.a('function');
    assume(logger.isLevelEnabled(level))[shouldBeEnabled ? 'true' : 'false']();
    assume(logger[specificChecker]())[shouldBeEnabled ? 'true' : 'false']();
  });
});