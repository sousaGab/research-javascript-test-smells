it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);
  assume(logger.isLevelEnabled).is.a('function');

  const levelStates = {
    error: true,
    warn: true,
    info: true,
    verbose: true,
    debug: false,
    silly: false
  };

  Object.entries(levelStates).forEach(([level, shouldBeEnabled]) => {
    const helperName = `is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`;

    assume(logger[helperName]).is.a('function');
    assume(logger.isLevelEnabled(level)).equals(shouldBeEnabled);
    assume(logger[helperName]()).equals(shouldBeEnabled);
  });
});