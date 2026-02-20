test('custom levels', () => {
  const setupLogger = (level) => serverlessExpressLogger({ level })
  
  const testLevel = (logger, levelName, calls, expectedCall) => {
    calls.forEach(({ method, message }) => {
      logger[method](message)
    })
    
    const callOrder = ['error', 'warn', 'info', 'debug', 'verbose']
    callOrder.forEach(method => {
      if (!calls.some(call => call.method === method)) {
        expect(global.console[method]).not.toHaveBeenCalled()
      }
    })
    
    expect(global.console[expectedCall.method]).toHaveBeenLastCalledWith({
      message: expectedCall.message
    })
  }

  // Test error level
  const loggerError = setupLogger('error')
  testLevel(loggerError, 'error', [
    { method: 'error', message: 'error' },
    { method: 'info', message: 'nocall' },
    { method: 'warn', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'error', message: 'error' })

  // Test warn level
  const loggerWarn = setupLogger('warn')
  testLevel(loggerWarn, 'warn', [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'warn', message: 'warn2' })

  // Test info level
  const loggerInfo = setupLogger('info')
  testLevel(loggerInfo, 'info', [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'info', message: 'info3' })

  // Test verbose level
  const loggerVerbose = setupLogger('verbose')
  testLevel(loggerVerbose, 'verbose', [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'verbose', message: 'verbose4' },
    { method: 'debug', message: 'nocall' }
  ], { method: 'debug', message: 'verbose4' })

  // Test debug level
  const loggerDebug = setupLogger('debug')
  testLevel(loggerDebug, 'debug', [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'verbose', message: 'verbose5' },
    { method: 'debug', message: 'debug5' }
  ], { method: 'debug', message: 'debug5' })
})