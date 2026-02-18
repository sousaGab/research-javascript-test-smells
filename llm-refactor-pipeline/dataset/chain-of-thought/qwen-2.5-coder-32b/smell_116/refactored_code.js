test('custom levels', () => {
  const setupLogger = (level) => serverlessExpressLogger({ level })
  const callLoggerMethods = (logger, calls) => {
    calls.forEach(([method, message]) => logger[method](message))
  }
  const assertConsoleCalls = (expectedCalls) => {
    expectedCalls.forEach(({ method, message }) => {
      expect(global.console[method]).toHaveBeenLastCalledWith({ message })
    })
  }

  // Test error level
  const loggerError = setupLogger('error')
  callLoggerMethods(loggerError, [
    ['error', 'error'],
    ['info', 'nocall'],
    ['warn', 'nocall'],
    ['debug', 'nocall'],
    ['verbose', 'nocall']
  ])
  expect(global.console.warn).not.toHaveBeenCalled()
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.info).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error' })

  // Test warn level
  const loggerWarn = setupLogger('warn')
  callLoggerMethods(loggerWarn, [
    ['error', 'error2'],
    ['warn', 'warn2'],
    ['info', 'nocall'],
    ['debug', 'nocall'],
    ['verbose', 'nocall']
  ])
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.info).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error2' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn2' })

  // Test info level
  const loggerInfo = setupLogger('info')
  callLoggerMethods(loggerInfo, [
    ['error', 'error3'],
    ['warn', 'warn3'],
    ['info', 'info3'],
    ['debug', 'nocall'],
    ['verbose', 'nocall']
  ])
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error3' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn3' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info3' })

  // Test verbose level
  const loggerVerbose = setupLogger('verbose')
  callLoggerMethods(loggerVerbose, [
    ['error', 'error4'],
    ['warn', 'warn4'],
    ['info', 'info4'],
    ['verbose', 'verbose4'],
    ['debug', 'nocall']
  ])
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error4' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn4' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info4' })
  expect(global.console.debug).toHaveBeenLastCalledWith({ message: 'verbose4' })

  // Test debug level
  const loggerDebug = setupLogger('debug')
  callLoggerMethods(loggerDebug, [
    ['error', 'error5'],
    ['warn', 'warn5'],
    ['info', 'info5'],
    ['verbose', 'verbose5'],
    ['debug', 'debug5']
  ])
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error5' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn5' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info5' })
  expect(global.console.debug).toHaveBeenLastCalledWith({ message: 'debug5' })
})