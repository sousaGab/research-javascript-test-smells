test('custom levels', () => {
  const setupLoggerTest = (level) => {
    const logger = serverlessExpressLogger({ level })
    return logger
  }

  const assertLogCalls = (logger, expectedCalls) => {
    expectedCalls.forEach(({ method, message }) => {
      expect(global.console[method]).toHaveBeenLastCalledWith({ message })
    })
  }

  const assertNoCalls = (methods) => {
    methods.forEach(method => {
      expect(global.console[method]).not.toHaveBeenCalled()
    })
  }

  const loggerError = setupLoggerTest('error')
  loggerError.error('error')
  loggerError.info('nocall')
  loggerError.warn('nocall')
  loggerError.debug('nocall')
  loggerError.verbose('nocall')
  assertNoCalls(['warn', 'debug', 'info'])
  assertLogCalls(loggerError, [{ method: 'error', message: 'error' }])

  const loggerWarn = setupLoggerTest('warn')
  loggerWarn.error('error2')
  loggerWarn.warn('warn2')
  loggerWarn.info('nocall')
  loggerWarn.debug('nocall')
  loggerWarn.verbose('nocall')
  assertNoCalls(['debug', 'info'])
  assertLogCalls(loggerWarn, [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' }
  ])

  const loggerInfo = setupLoggerTest('info')
  loggerInfo.error('error3')
  loggerInfo.warn('warn3')
  loggerInfo.info('info3')
  loggerInfo.debug('nocall')
  loggerInfo.verbose('nocall')
  assertNoCalls(['debug'])
  assertLogCalls(loggerInfo, [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' }
  ])

  const loggerVerbose = setupLoggerTest('verbose')
  loggerVerbose.error('error4')
  loggerVerbose.warn('warn4')
  loggerVerbose.info('info4')
  loggerVerbose.verbose('verbose4')
  loggerVerbose.debug('nocall')
  assertLogCalls(loggerVerbose, [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'debug', message: 'verbose4' }
  ])

  const loggerDebug = setupLoggerTest('debug')
  loggerDebug.error('error5')
  loggerDebug.warn('warn5')
  loggerDebug.info('info5')
  loggerDebug.verbose('verbose5')
  loggerDebug.debug('debug5')
  assertLogCalls(loggerDebug, [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'debug', message: 'debug5' }
  ])
})