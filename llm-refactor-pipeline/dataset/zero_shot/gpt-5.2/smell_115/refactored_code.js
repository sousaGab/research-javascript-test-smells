it('default levels', function () {
  const logger = winston.createLogger({
    level: 'verbose',
    levels: winston.config.npm.levels,
    transports: [new winston.transports.Console()]
  });

  assume(logger.getHighestLogLevel).is.a('function');
  assume(logger.getHighestLogLevel()).equals(4);

  const enabledChecks = [
    ['isLevelEnabled', null, true],
    ['isErrorEnabled', null, true],
    ['isWarnEnabled', null, true],
    ['isInfoEnabled', null, true],
    ['isVerboseEnabled', null, true],
    ['isDebugEnabled', null, true],
    ['isSillyEnabled', null, true]
  ];

  enabledChecks.forEach(([methodName]) => {
    assume(logger[methodName]).is.a('function');
  });

  const levelEnabledExpectations = [
    ['error', true],
    ['warn', true],
    ['info', true],
    ['verbose', true],
    ['debug', false],
    ['silly', false]
  ];

  levelEnabledExpectations.forEach(([level, expected]) => {
    assume(logger.isLevelEnabled(level)).equals(expected);
  });

  const shorthandEnabledExpectations = [
    ['isErrorEnabled', true],
    ['isWarnEnabled', true],
    ['isInfoEnabled', true],
    ['isVerboseEnabled', true],
    ['isDebugEnabled', false],
    ['isSillyEnabled', false]
  ];

  shorthandEnabledExpectations.forEach(([methodName, expected]) => {
    assume(logger[methodName]()).equals(expected);
  });
});