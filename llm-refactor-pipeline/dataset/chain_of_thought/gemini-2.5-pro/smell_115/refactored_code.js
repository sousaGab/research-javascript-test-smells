it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);
  assume(logger.isLevelEnabled).is.a('function');

  const enabledLevels = ['error', 'warn', 'info', 'verbose'];
  const disabledLevels = ['debug', 'silly'];

  const assertLevel = (level, shouldBeEnabled) => {
    const helperMethodName = `is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`;

    assume(logger[helperMethodName]).is.a('function');
    assume(logger.isLevelEnabled(level)).equals(shouldBeEnabled);
    assume(logger[helperMethodName]()).equals(shouldBeEnabled);
  };

  enabledLevels.forEach(level => assertLevel(level, true));
  disabledLevels.forEach(level => assertLevel(level, false));
});