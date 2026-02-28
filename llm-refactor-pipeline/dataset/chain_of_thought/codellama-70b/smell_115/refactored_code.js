it('default levels', function () {
  let logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  assume(logger.isLevelEnabled).is.a('function');

  assume(logger.isErrorEnabled).is.a('function');
  assume(logger.isWarnEnabled).is.a('function');
  assume(logger.isInfoEnabled).is.a('function');
  assume(logger.isVerboseEnabled).is.a('function');
  assume(logger.isDebugEnabled).is.a('function');
  assume(logger.isSillyEnabled).is.a('function');

  assume(logger.isLevelEnabled('error')).true();
  assume(logger.isLevelEnabled('warn')).true();
  assume(logger.isLevelEnabled('info')).true();
  assume(logger.isLevelEnabled('verbose')).true();
  assume(logger.isLevelEnabled('debug')).false();
  assume(logger.isLevelEnabled('silly')).false();

  assume(logger.isErrorEnabled()).true();
  assume(logger.isWarnEnabled()).true();
  assume(logger.isInfoEnabled()).true();
  assume(logger.isVerboseEnabled()).true();
  assume(logger.isDebugEnabled()).false();
  assume(logger.isSillyEnabled()).false();
})