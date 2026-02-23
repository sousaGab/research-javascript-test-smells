it('default levels', function () {
        let logger = winston.createLogger({
          level: 'verbose',
          levels: winston.config.npm.levels,
          transports: [new winston.transports.Console()]
        });

        assume(logger.getHighestLogLevel).is.a('function');
        assume(logger.getHighestLogLevel()).equals(4);

        assume(logger.isLevelEnabled).is.a('function');

        const levelMethods = ['isErrorEnabled', 'isWarnEnabled', 'isInfoEnabled', 'isVerboseEnabled', 'isDebugEnabled', 'isSillyEnabled'];
        levelMethods.forEach(method => {
          assume(logger[method]).is.a('function');
        });

        const enabledLevels = ['error', 'warn', 'info', 'verbose'];
        const disabledLevels = ['debug', 'silly'];

        enabledLevels.forEach(level => {
          assume(logger.isLevelEnabled(level)).true();
        });

        disabledLevels.forEach(level => {
          assume(logger.isLevelEnabled(level)).false();
        });

        assume(logger.isErrorEnabled()).true();
        assume(logger.isWarnEnabled()).true();
        assume(logger.isInfoEnabled()).true();
        assume(logger.isVerboseEnabled()).true();
        assume(logger.isDebugEnabled()).false();
        assume(logger.isSillyEnabled()).false();
      })