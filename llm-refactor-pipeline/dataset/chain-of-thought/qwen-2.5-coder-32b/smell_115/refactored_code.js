it('default levels', function () {
  let logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  // Test enabled methods
  const enabledMethods = ['isErrorEnabled', 'isWarnEnabled', 'isInfoEnabled', 'isVerboseEnabled'];
  const disabledMethods = ['isDebugEnabled', 'isSillyEnabled'];

  enabledMethods.forEach(method => assume(logger[method]).is.a('function'));
  disabledMethods.forEach(method => assume(logger[method]).is.a('function'));

  // Test level enabling status
  assume(logger.isLevelEnabled('error')).true();
  assume(logger.isLevelEnabled('warn')).true();
  assume(logger.isLevelEnabled('info')).true();
  assume(logger.isLevelEnabled('verbose')).true();
  assume(logger.isLevelEnabled('debug')).false();
  assume(logger.isLevelEnabled('silly')).false();

  // Test method-based enabling status
  assume(logger.isErrorEnabled()).true();
  assume(logger.isWarnEnabled()).true();
  assume(logger.isInfoEnabled()).true();
  assume(logger.isVerboseEnabled()).true();
  assume(logger.isDebugEnabled()).false();
  assume(logger.isSillyEnabled()).false();
});