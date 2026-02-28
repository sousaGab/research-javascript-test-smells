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
    { level: 'error', enabled: true },
    { level: 'warn', enabled: true },
    { level: 'info', enabled: true },
    { level: 'verbose', enabled: true },
    { level: 'debug', enabled: false },
    { level: 'silly', enabled: false }
  ];

  levelChecks.forEach(({ level, enabled }) => {
    assume(logger[`is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`]).is.a('function');
    assume(logger.isLevelEnabled(level))[enabled ? 'true' : 'false']();
    assume(logger[`is${level.charAt(0).toUpperCase() + level.slice(1)}Enabled`]())[enabled ? 'true' : 'false']();
  });
});