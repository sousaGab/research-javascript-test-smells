// Your COMPLETE refactored test code here
it('default levels', function () {
    const logger = winston.createLogger({
        level: 'verbose',
        levels: winston.config.npm.levels,
        transports: [new winston.transports.Console()]
    });

    expect(logger.getHighestLogLevel).toBeA('function');
    expect(logger.getHighestLogLevel()).toEqual(4);

    expect(logger.isLevelEnabled).toBeA('function');

    expect(logger.isErrorEnabled).toBeA('function');
    expect(logger.isWarnEnabled).toBeA('function');
    expect(logger.isInfoEnabled).toBeA('function');
    expect(logger.isVerboseEnabled).toBeA('function');
    expect(logger.isDebugEnabled).toBeA('function');
    expect(logger.isSillyEnabled).toBeA('function');

    expect(logger.isLevelEnabled('error')).toBeTrue();
    expect(logger.isLevelEnabled('warn')).toBeTrue();
    expect(logger.isLevelEnabled('info')).toBeTrue();
    expect(logger.isLevelEnabled('verbose')).toBeTrue();
    expect(logger.isLevelEnabled('debug')).toBeFalse();
    expect(logger.isLevelEnabled('silly')).toBeFalse();

    expect(logger.isErrorEnabled()).toBeTrue();
    expect(logger.isWarnEnabled()).toBeTrue();
    expect(logger.isInfoEnabled()).toBeTrue();
    expect(logger.isVerboseEnabled()).toBeTrue();
    expect(logger.isDebugEnabled()).toBeFalse();
    expect(logger.isSillyEnabled()).toBeFalse();
});