test('custom levels', () => {
  const loggerError = serverlessExpressLogger({ level: 'error' })
  const loggerWarn = serverlessExpressLogger({ level: 'warn' })
  const loggerInfo = serverlessExpressLogger({ level: 'info' })
  const loggerVerbose = serverlessExpressLogger({ level: 'verbose' })
  const loggerDebug = serverlessExpressLogger({ level: 'debug' })

  test('error level', () => {
    loggerError.error('error')
    expect(global.console.error).toHaveBeenLastCalledWith({
      message: 'error'
    })
  })

  test('warn level', () => {
    loggerWarn.warn('warn2')
    expect(global.console.warn).toHaveBeenLastCalledWith({
      message: 'warn2'
    })
  })

  test('info level', () => {
    loggerInfo.info('info3')
    expect(global.console.info).toHaveBeenLastCalledWith({
      message: 'info3'
    })
  })

  test('verbose level', () => {
    loggerVerbose.verbose('verbose4')
    expect(global.console.debug).toHaveBeenLastCalledWith({
      message: 'verbose4'
    })
  })

  test('debug level', () => {
    loggerDebug.debug('debug5')
    expect(global.console.debug).toHaveBeenLastCalledWith({
      message: 'debug5'
    })
  })
})