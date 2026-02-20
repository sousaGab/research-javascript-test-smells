test('custom levels', () => {
  const setupLoggerAndVerify = (level, calls, expectedLastCall) => {
    const logger = serverlessExpressLogger({ level })
    calls.forEach(({ method, message }) => logger[method](message))
    expect(global.console.debug).not.toHaveBeenCalled()
    expect(global.console.info).not.toHaveBeenCalled()
    expect(global.console.warn).not.toHaveBeenCalled()
    expect(global.console.error).toHaveBeenLastCalledWith({ message: expectedLastCall })
  }

  setupLoggerAndVerify('error', [
    { method: 'error', message: 'error' },
    { method: 'info', message: 'nocall' },
    { method: 'warn', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], 'error')

  setupLoggerAndVerify('warn', [
    { method: 'error', message: 'error2' },
    { method: 'warn', message: 'warn2' },
    { method: 'info', message: 'nocall' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], 'warn2')

  setupLoggerAndVerify('info', [
    { method: 'error', message: 'error3' },
    { method: 'warn', message: 'warn3' },
    { method: 'info', message: 'info3' },
    { method: 'debug', message: 'nocall' },
    { method: 'verbose', message: 'nocall' }
  ], 'info3')

  setupLoggerAndVerify('verbose', [
    { method: 'error', message: 'error4' },
    { method: 'warn', message: 'warn4' },
    { method: 'info', message: 'info4' },
    { method: 'verbose', message: 'verbose4' },
    { method: 'debug', message: 'nocall' }
  ], 'verbose4')

  setupLoggerAndVerify('debug', [
    { method: 'error', message: 'error5' },
    { method: 'warn', message: 'warn5' },
    { method: 'info', message: 'info5' },
    { method: 'verbose', message: 'verbose5' },
    { method: 'debug', message: 'debug5' }
  ], 'debug5')
})