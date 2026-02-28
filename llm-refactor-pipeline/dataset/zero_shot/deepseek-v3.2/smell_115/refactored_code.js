it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);
  assume(logger.isLevelEnabled).is.a('function');

  const levels = [
    { name: 'error', enabled: true },
    { name: 'warn', enabled: true },
    { name: 'info', enabled: true },
    { name: 'verbose', enabled: true },
    { name: 'debug', enabled: false },
    { name: 'silly', enabled: false }
  ];

  levels.forEach(({ name, enabled }) => {
    assume(logger[`is${name.charAt(0).toUpperCase() + name.slice(1)}Enabled`]).is.a('function');
    assume(logger.isLevelEnabled(name)).equals(enabled);
    assume(logger[`is${name.charAt(0).toUpperCase() + name.slice(1)}Enabled`]()).equals(enabled);
  });
});