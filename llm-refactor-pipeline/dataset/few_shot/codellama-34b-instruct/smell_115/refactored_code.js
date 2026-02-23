it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  expect(logger.getHighestLogLevel).toBeInstanceOf(Function);
  expect(logger.getHighestLogLevel()).toBe(4);

  expect(logger.isLevelEnabled).toBeInstanceOf(Function);

  expect(logger.isErrorEnabled).toBeInstanceOf(Function);
  expect(logger.isWarnEnabled).toBeInstanceOf(Function);
  expect(logger.isInfoEnabled).toBeInstanceOf(Function);
  expect(logger.isVerboseEnabled).toBeInstanceOf(Function);
  expect(logger.isDebugEnabled).toBeInstanceOf(Function);
  expect(logger.isSillyEnabled).toBeInstanceOf(Function);

  expect(logger.isLevelEnabled('error')).toBe(true);
  expect(logger.isLevelEnabled('warn')).toBe(true);
  expect(logger.isLevelEnabled('info')).toBe(true);
  expect(logger.isLevelEnabled('verbose')).toBe(true);
  expect(logger.isLevelEnabled('debug')).toBe(false);
  expect(logger.isLevelEnabled('silly')).toBe(false);

  expect(logger.isErrorEnabled()).toBe(true);
  expect(logger.isWarnEnabled()).toBe(true);
  expect(logger.isInfoEnabled()).toBe(true);
  expect(logger.isVerboseEnabled()).toBe(true);
  expect(logger.isDebugEnabled()).toBe(false);
  expect(logger.isSillyEnabled()).toBe(false);
});