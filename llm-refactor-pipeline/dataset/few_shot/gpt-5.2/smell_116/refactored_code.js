test('custom levels', () => {
  const runCase = ({ level, calls, notCalled = [], lastCalledWith = {} }) => {
    const logger = serverlessExpressLogger({ level })

    calls.forEach(({ method, message }) => logger[method](message))

    notCalled.forEach((consoleMethod) => {
      expect(global.console[consoleMethod]).not.toHaveBeenCalled()
    })

    Object.entries(lastCalledWith).forEach(([consoleMethod, message]) => {
      expect(global.console[consoleMethod]).toHaveBeenLastCalledWith({ message })
    })
  }

  runCase({
    level: 'error',
    calls: [
      { method: 'error', message: 'error' },
      { method: 'info', message: 'nocall' },
      { method: 'warn', message: 'nocall' },
      { method: 'debug', message: 'nocall' },
      { method: 'verbose', message: 'nocall' }
    ],
    notCalled: ['warn', 'debug', 'info'],
    lastCalledWith: { error: 'error' }
  })

  runCase({
    level: 'warn',
    calls: [
      { method: 'error', message: 'error2' },
      { method: 'warn', message: 'warn2' },
      { method: 'info', message: 'nocall' },
      { method: 'debug', message: 'nocall' },
      { method: 'verbose', message: 'nocall' }
    ],
    notCalled: ['debug', 'info'],
    lastCalledWith: { error: 'error2', warn: 'warn2' }
  })

  runCase({
    level: 'info',
    calls: [
      { method: 'error', message: 'error3' },
      { method: 'warn', message: 'warn3' },
      { method: 'info', message: 'info3' },
      { method: 'debug', message: 'nocall' },
      { method: 'verbose', message: 'nocall' }
    ],
    notCalled: ['debug'],
    lastCalledWith: { error: 'error3', warn: 'warn3', info: 'info3' }
  })

  runCase({
    level: 'verbose',
    calls: [
      { method: 'error', message: 'error4' },
      { method: 'warn', message: 'warn4' },
      { method: 'info', message: 'info4' },
      { method: 'verbose', message: 'verbose4' },
      { method: 'debug', message: 'nocall' }
    ],
    lastCalledWith: { error: 'error4', warn: 'warn4', info: 'info4', debug: 'verbose4' }
  })

  runCase({
    level: 'debug',
    calls: [
      { method: 'error', message: 'error5' },
      { method: 'warn', message: 'warn5' },
      { method: 'info', message: 'info5' },
      { method: 'verbose', message: 'verbose5' },
      { method: 'debug', message: 'debug5' }
    ],
    lastCalledWith: { error: 'error5', warn: 'warn5', info: 'info5', debug: 'debug5' }
  })
})