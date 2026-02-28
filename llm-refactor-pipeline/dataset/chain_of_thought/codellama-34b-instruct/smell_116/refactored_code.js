// Your COMPLETE refactored test code here

test('custom levels', () => {
  const loggerError = serverlessExpressLogger({ level: 'error' });
  const loggerWarn = serverlessExpressLogger({ level: 'warn' });
  const loggerInfo = serverlessExpressLogger({ level: 'info' });
  const loggerVerbose = serverlessExpressLogger({ level: 'verbose' });
  const loggerDebug = serverlessExpressLogger({ level: 'debug' });

  loggerError.error('error');
  loggerError.info('nocall');
  loggerError.warn('nocall');
  loggerError.debug('nocall');
  loggerError.verbose('nocall');
  expect(global.console.warn).not.toHaveBeenCalled();
  expect(global.console.debug).not.toHaveBeenCalled();
  expect(global.console.info).not.toHaveBeenCalled();
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error'
  });

  loggerWarn.error('error2');
  loggerWarn.warn('warn2');
  loggerWarn.info('nocall');
  loggerWarn.debug('nocall');
  loggerWarn.verbose('nocall');
  expect(global.console.debug).not.toHaveBeenCalled();
  expect(global.console.info).not.toHaveBeenCalled();
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error2'
  });
  expect(global.console.warn).toHaveBeenLastCalledWith({
    message: 'warn2'
  });

  loggerInfo.error('error3');
  loggerInfo.warn('warn3');
  loggerInfo.info('info3');
  loggerInfo.debug('nocall');
  loggerInfo.verbose('nocall');
  expect(global.console.debug).not.toHaveBeenCalled();
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error3'
  });
  expect(global.console.warn).toHaveBeenLastCalledWith({
    message: 'warn3'
  });
  expect(global.console.info).toHaveBeenLastCalledWith({
    message: 'info3'
  });

  loggerVerbose.error('error4');
  loggerVerbose.warn('warn4');
  loggerVerbose.info('info4');
  loggerVerbose.verbose('verbose4');
  loggerVerbose.debug('nocall');
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error4'
  });
  expect(global.console.warn).toHaveBeenLastCalledWith({
    message: 'warn4'
  });
  expect(global.console.info).toHaveBeenLastCalledWith({
    message: 'info4'
  });
  expect(global.console.debug).toHaveBeenLastCalledWith({
    message: 'verbose4'
  });

  loggerDebug.error('error5');
  loggerDebug.warn('warn5');
  loggerDebug.info('info5');
  loggerDebug.verbose('verbose5');
  loggerDebug.debug('debug5');
  expect(global.console.error).toHaveBeenLastCalledWith({
    message: 'error5'
  });
  expect(global.console.warn).toHaveBeenLastCalledWith({
    message: 'warn5'
  });
  expect(global.console.info).toHaveBeenLastCalledWith({
    message: 'info5'
  });
  expect(global.console.debug).toHaveBeenLastCalledWith({
    message: 'debug5'
  });
});