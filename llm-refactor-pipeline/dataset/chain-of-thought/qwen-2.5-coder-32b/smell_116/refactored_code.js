test('custom levels', () => {
  const setupLoggerAndVerify = (level, calls) => {
    const logger = serverlessExpressLogger({ level })
    calls.forEach(({ method, message, shouldCall }) => {
      logger[method](message)
    })
    
    const expectedCalls = calls.filter(call => call.shouldCall)
    const unexpectedCalls = calls.filter(call => !call.shouldCall)

    unexpectedCalls.forEach(call => {
      expect(global.console[call.method]).not.toHaveBeenCalled()
    })

    if (expectedCalls.length > 0) {
      const lastCall = expectedCalls[expectedCalls.length - 1]
      expect(global.console[lastCall.method]).toHaveBeenLastCalledWith({
        message: lastCall.message
      })
    }
  }

  setupLoggerAndVerify('error', [
    { method: 'error', message: 'error', shouldCall: true },
    { method: 'info', message: 'nocall', shouldCall: false },
    { method: 'warn', message: 'nocall', shouldCall: false },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ])

  setupLoggerAndVerify('warn', [
    { method: 'error', message: 'error2', shouldCall: true },
    { method: 'warn', message: 'warn2', shouldCall: true },
    { method: 'info', message: 'nocall', shouldCall: false },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ])

  setupLoggerAndVerify('info', [
    { method: 'error', message: 'error3', shouldCall: true },
    { method: 'warn', message: 'warn3', shouldCall: true },
    { method: 'info', message: 'info3', shouldCall: true },
    { method: 'debug', message: 'nocall', shouldCall: false },
    { method: 'verbose', message: 'nocall', shouldCall: false }
  ])

  setupLoggerAndVerify('verbose', [
    { method: 'error', message: 'error4', shouldCall: true },
    { method: 'warn', message: 'warn4', shouldCall: true },
    { method: 'info', message: 'info4', shouldCall: true },
    { method: 'verbose', message: 'verbose4', shouldCall: true },
    { method: 'debug', message: 'nocall', shouldCall: false }
  ])

  setupLoggerAndVerify('debug', [
    { method: 'error', message: 'error5', shouldCall: true },
    { method: 'warn', message: 'warn5', shouldCall: true },
    { method: 'info', message: 'info5', shouldCall: true },
    { method: 'verbose', message: 'verbose5', shouldCall: true },
    { method: 'debug', message: 'debug5', shouldCall: true }
  ])
})