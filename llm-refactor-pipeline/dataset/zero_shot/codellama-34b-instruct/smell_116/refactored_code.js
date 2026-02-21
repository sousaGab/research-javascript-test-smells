test('custom levels', () => {
  const loggerError = serverlessExpressLogger({ level: 'error' });
  const loggerWarn = serverlessExpressLogger({ level: 'warn' });
  const loggerInfo = serverlessExpressLogger({ level: 'info' });
  const loggerVerbose = serverlessExpressLogger({ level: 'verbose' });
  const loggerDebug = serverlessExpressLogger({ level: 'debug' });

  function verboseLog(logger, message) {
    logger.verbose(message);
  }

  verboseLog(loggerError, 'error');
  verboseLog(loggerWarn, 'warn2');
  verboseLog(loggerInfo, 'info3');
  verboseLog(loggerVerbose, 'verbose4');
  verboseLog(loggerDebug, 'debug5');

  expect(global.console.warn).not.toHaveBeenCalled();
  expect(global.console.debug).not.toHaveBeenCalled();
  expect(global.console.info).not.toHaveBeenCalled();
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error'
  });

  expect(global.console.warn).toHaveBeenLastCalledWith({
    message: 'warn2'
  });
  expect(global.console.info).toHaveBeenLastCalledWith({
    message: 'info3'
  });
  expect(global.console.debug).toHaveBeenLastCalledWith({
    message: 'verbose4'
  });
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'debug5'
  });
});