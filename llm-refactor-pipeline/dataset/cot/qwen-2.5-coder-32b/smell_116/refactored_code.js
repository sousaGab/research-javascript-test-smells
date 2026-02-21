test('custom levels', () => {
  const setupLoggerAndAssert = (level, calls, expectedCalls) => {
    const logger = serverlessExpressLogger({ level })
    calls.forEach(({ method, message }) => logger[method](message))
    expectedCalls.forEach(({ method, message }) => {
      if (method) {
        expect(global.console[method]).toHaveBeenLastCalledWith({ message })
      } else {
        expect(global.console[method]).not.toHaveBeenCalled()
      }
    })
  }

  setupLoggerAndAssert('error', [
    { method: 'error', message: 'error' },
    { method: 'info', message: 'nocall' },
    { method: 'warn', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], [
    { method: 'error', message: 'error' },
    { method: 'warn' },
    { method: 'info' },
    { method: 'debug' }
  ])

  setupLoggerAndAssert('warn', [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info' },
    { method: 'debug' }
  ])

  setupLoggerAndAssert('info', [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug' }
  ])

  setupLoggerAndAssert('verbose', [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'verbose', message: 'verbose4' },
    { method: 'debug', message: 'nocall' }
  ], [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'debug', message: 'verbose4' }
  ])

  setupLoggerAndAssert('debug', [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'verbose', message: 'verbose5' },
    { method: 'debug', message: 'debug5' }
  ], [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'debug', message: 'debug5' }
  ])
})