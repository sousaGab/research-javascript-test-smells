test('custom levels', () => {
  const runCase = ({
    level,
    messages,
    expectedLastCalls = {},
    expectedNotCalled = []
  }) => {
    const logger = serverlessExpressLogger({ level })

    Object.entries(messages).forEach(([method, message]) => {
      logger[method](message)
    })

    expectedNotCalled.forEach((consoleMethod) => {
      expect(global.console[consoleMethod]).not.toHaveBeenCalled()
    })

    Object.entries(expectedLastCalls).forEach(([consoleMethod, message]) => {
      expect(global.console[consoleMethod]).toHaveBeenLastCalledWith({ message })
    })
  }

  runCase({
    level: 'error',
    messages: {
      error: 'error',
      info: 'nocall',
      warn: 'nocall',
      debug: 'nocall',
      verbose: 'nocall'
    },
    expectedNotCalled: ['warn', 'debug', 'info'],
    expectedLastCalls: { error: 'error' }
  })

  runCase({
    level: 'warn',
    messages: {
      error: 'error2',
      warn: 'warn2',
      info: 'nocall',
      debug: 'nocall',
      verbose: 'nocall'
    },
    expectedNotCalled: ['debug', 'info'],
    expectedLastCalls: { error: 'error2', warn: 'warn2' }
  })

  runCase({
    level: 'info',
    messages: {
      error: 'error3',
      warn: 'warn3',
      info: 'info3',
      debug: 'nocall',
      verbose: 'nocall'
    },
    expectedNotCalled: ['debug'],
    expectedLastCalls: { error: 'error3', warn: 'warn3', info: 'info3' }
  })

  runCase({
    level: 'verbose',
    messages: {
      error: 'error4',
      warn: 'warn4',
      info: 'info4',
      verbose: 'verbose4',
      debug: 'nocall'
    },
    expectedLastCalls: {
      error: 'error4',
      warn: 'warn4',
      info: 'info4',
      debug: 'verbose4'
    }
  })

  runCase({
    level: 'debug',
    messages: {
      error: 'error5',
      warn: 'warn5',
      info: 'info5',
      verbose: 'verbose5',
      debug: 'debug5'
    },
    expectedLastCalls: {
      error: 'error5',
      warn: 'warn5',
      info: 'info5',
      debug: 'debug5'
    }
  })
})