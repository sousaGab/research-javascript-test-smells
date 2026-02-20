test('custom levels', () => {
  const loggerError = serverlessExpressLogger({ level: 'error' })
  const loggerWarn = serverlessExpressLogger({ level: 'warn' })
  const loggerInfo = serverlessExpressLogger({ level: 'info' })
  const loggerVerbose = serverlessExpressLogger({ level: 'verbose' })
  const loggerDebug = serverlessExpressLogger({ level: 'debug' })

  loggerError.error('error')
  loggerWarn.warn('warn')
  loggerInfo.info('info')
  loggerVerbose.verbose('verbose')
  loggerDebug.debug('debug')

  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info' })
  expect(global.console.verbose).toHaveBeenLastCalledWith({ message: 'verbose' })
  expect(global.console.debug).toHaveBeenLastCalledWith({ message: 'debug' })
})