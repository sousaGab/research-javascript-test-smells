it('default levels', function () {
  let logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);
  assume(logger.isLevelEnabled).is.a('function');

  const enabledLevels = ['error', 'warn', 'info', 'verbose'];
  const disabledLevels = ['debug', 'silly'];

  enabledLevels.forEach(level => {
    assume(logger.isLevelEnabled(level)).true();
    assume(logger[`is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`]()).true();
  });

  disabledLevels.forEach(level => {
    assume(logger.isLevelEnabled(level)).false();
    assume(logger[`is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`]()).false();
  });
});