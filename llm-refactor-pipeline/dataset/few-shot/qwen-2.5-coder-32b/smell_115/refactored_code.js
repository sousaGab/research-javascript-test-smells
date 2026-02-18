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

        const enabledLevels = ['error', 'warn', 'info', 'verbose'];
        const disabledLevels = ['debug', 'silly'];

        enabledLevels.forEach(level => {
          assume(logger.isLevelEnabled(level)).true();
          assume(logger.isLevelEnabled()(level)).true();
        });

        disabledLevels.forEach(level => {
          assume(logger.isLevelEnabled(level)).false();
          assume(logger.isLevelEnabled()(level)).false();
        });
      })