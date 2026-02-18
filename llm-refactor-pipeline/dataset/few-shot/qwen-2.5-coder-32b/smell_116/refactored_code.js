test('custom levels', () => {
  const setupLogger = (level) => serverlessExpressLogger({ level })
  
  const testLevel = (logger, level, expectedCalls) => {
    Object.keys(expectedCalls).forEach(method => {
      if (expectedCalls[method]) {
        logger[method](expectedCalls[method])
      } else {
        logger[method]('nocall')
      }
    })
    
    expectedCalls.forEach(call => {
      expect(global.console[call.method]).toHaveBeenCalledWith({ message: call.message })
    })
  }

  // Test error level
  const loggerError = setupLogger('error')
  testLevel(loggerError, 'error', [
    { method: 'error', message: 'error' },
    { method: 'warn', message: 'nocall' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ])
  expect(global.console.warn).not.toHaveBeenCalled()
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.info).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error' })

  // Test warn level
  const loggerWarn = setupLogger('warn')
  testLevel(loggerWarn, 'warn', [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ])
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.info).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error2' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn2' })

  // Test info level
  const loggerInfo = setupLogger('info')
  testLevel(loggerInfo, 'info', [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ])
  expect(global.console.debug).not.toHaveBeenCalled()
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error3' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn3' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info3' })

  // Test verbose level
  const loggerVerbose = setupLogger('verbose')
  testLevel(loggerVerbose, 'verbose', [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'verbose', message: 'verbose4' },
    { method: 'debug', message: 'nocall' }
  ])
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error4' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn4' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info4' })
  expect(global.console.debug).toHaveBeenLastCalledWith({ message: 'verbose4' })

  // Test debug level
  const loggerDebug = setupLogger('debug')
  testLevel(loggerDebug, 'debug', [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'verbose', message: 'verbose5' },
    { method: 'debug', message: 'debug5' }
  ])
  expect(global.console.error).toHaveBeenLastCalledWith({ message: 'error5' })
  expect(global.console.warn).toHaveBeenLastCalledWith({ message: 'warn5' })
  expect(global.console.info).toHaveBeenLastCalledWith({ message: 'info5' })
  expect(global.console.debug).toHaveBeenLastCalledWith({ message: 'debug5' })
})