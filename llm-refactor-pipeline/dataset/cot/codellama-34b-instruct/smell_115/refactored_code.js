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