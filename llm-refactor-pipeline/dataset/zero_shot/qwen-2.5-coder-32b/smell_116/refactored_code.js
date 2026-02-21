test('custom levels', () => {
  const testLevel = (level, calls, expectedLastCall) => {
    const logger = serverlessExpressLogger({ level })
    
    calls.forEach(({ method, message }) => {
      logger[method](message)
    })
    
    // Check that only expected methods were called
    const expectedCalls = new Set(expectedLastCall.method)
    const allMethods = ['error', 'warn', 'info', 'debug', 'verbose']
    
    allMethods.forEach(method => {
      if (expectedCalls.has(method)) {
        expect(global.console[method]).toHaveBeenCalled()
      } else {
        expect(global.console[method]).not.toHaveBeenCalled()
      }
    })
    
    // Check last call
    expect(global.console[expectedLastCall.method]).toHaveBeenLastCalledWith({
      message: expectedLastCall.message
    })
  }

  testLevel('error', [
    { method: 'error', message: 'error' },
    { method: 'info', message: 'nocall' },
    { method: 'warn', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'error', message: 'error' })

  testLevel('warn', [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'warn', message: 'warn2' })

  testLevel('info', [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], { method: 'info', message: 'info3' })

  testLevel('verbose', [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'verbose', message: 'verbose4' },
    { method: 'debug', message: 'nocall' }
  ], { method: 'verbose', message: 'verbose4' })

  testLevel('debug', [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'verbose', message: 'verbose5' },
    { method: 'debug', message: 'debug5' }
  ], { method: 'debug', message: 'debug5' })
})