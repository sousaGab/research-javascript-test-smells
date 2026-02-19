test('custom levels', () => {
  const setupLogger = (level) => serverlessExpressLogger({ level })
  
  const testLevel = (logger, levelName, calls, expectedCall) => {
    calls.forEach(({ method, message, shouldCall }) => {
      if (shouldCall) {
        logger[method](message)
      } else {
        logger[method]('nocall')
      }
    })
    
    expect(global.console.error).toHaveBeenLastCalledWith({ message: expectedCall })
  }

  // Test error level
  const loggerError = setupLogger('error')
  testLevel(loggerError, 'error', [
    { method: 'error', message: 'error', shouldCall: true },
    { method: 'info', message: 'nocall', shouldCall: false },
    { method: 'warn', message: 'nocall', shouldCall: false },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ], 'error')

  // Test warn level
  const loggerWarn = setupLogger('warn')
  testLevel(loggerWarn, 'warn', [
    { method: 'error', message: 'error2', shouldCall: true },
    { method: 'warn', message: 'warn2', shouldCall: true },
    { method: 'info', message: 'nocall', shouldCall: false },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ], 'warn2')

  // Test info level
  const loggerInfo = setupLogger('info')
  testLevel(loggerInfo, 'info', [
    { method: 'error', message: 'error3', shouldCall: true },
    { method: 'warn', message: 'warn3', shouldCall: true },
    { method: 'info', message: 'info3', shouldCall: true },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ], 'info3')

  // Test verbose level
  const loggerVerbose = setupLogger('verbose')
  testLevel(loggerVerbose, 'verbose', [
    { method: 'error', message: 'error4', shouldCall: true },
    { method: 'warn', message: 'warn4', shouldCall: true },
    { method: 'info', message: 'info4', shouldCall: true },
    { method: 'verbose', message: 'verbose4', shouldCall: true },
    { method: 'debug', message: 'nocall', shouldCall: false }
  ], 'verbose4')

  // Test debug level
  const loggerDebug = setupLogger('debug')
  testLevel(loggerDebug, 'debug', [
    { method: 'error', message: 'error5', shouldCall: true },
    { method: 'warn', message: 'warn5', shouldCall: true },
    { method: 'info', message: 'info5', shouldCall: true },
    { method: 'verbose', message: 'verbose5', shouldCall: true },
    { method: 'debug', message: 'debug5', shouldCall: true }
  ], 'debug5')
})