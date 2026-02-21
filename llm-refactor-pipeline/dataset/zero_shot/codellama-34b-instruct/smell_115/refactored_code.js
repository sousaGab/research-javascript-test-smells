it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assertLevelEnabled(logger, 'error', true);
  assertLevelEnabled(logger, 'warn', true);
  assertLevelEnabled(logger, 'info', true);
  assertLevelEnabled(logger, 'verbose', true);
  assertLevelEnabled(logger, 'debug', false);
  assertLevelEnabled(logger, 'silly', false);

  assertIsLevelEnabled(logger, 'error', true);
  assertIsLevelEnabled(logger, 'warn', true);
  assertIsLevelEnabled(logger, 'info', true);
  assertIsLevelEnabled(logger, 'verbose', true);
  assertIsLevelEnabled(logger, 'debug', false);
  assertIsLevelEnabled(logger, 'silly', false);
});

function assertLevelEnabled(logger, level, expected) {
  assume(logger.isLevelEnabled(level)).equals(expected);
}

function assertIsLevelEnabled(logger, level, expected) {
  assume(logger[`is${level}Enabled`]()).equals(expected);
}