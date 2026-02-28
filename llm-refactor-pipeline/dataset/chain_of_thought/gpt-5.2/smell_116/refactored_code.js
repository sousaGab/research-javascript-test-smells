test('custom levels', () => {
  const runLevelCase = ({
    level,
    calls,
    expectedLastCalls = {},
    expectedNotCalled = []
  }) => {
    const logger = serverlessExpressLogger({ level })

    calls.forEach(([method, message]) => logger[method](message))

    expectedNotCalled.forEach((consoleMethod) => {
      expect(global.console[consoleMethod]).not.toHaveBeenCalled()
    })

    Object.entries(expectedLastCalls).forEach(([consoleMethod, message]) => {
      expect(global.console[consoleMethod]).toHaveBeenLastCalledWith({ message })
    })
  }

  runLevelCase({
    level: 'error',
    calls: [
      ['error', 'error'],
      ['info', 'nocall'],
      ['warn', 'nocall'],
      ['debug', 'nocall'],
      ['verbose', 'nocall']
    ],
    expectedNotCalled: ['warn', 'debug', 'info'],
    expectedLastCalls: { error: 'error' }
  })

  runLevelCase({
    level: 'warn',
    calls: [
      ['error', 'error2'],
      ['warn', 'warn2'],
      ['info', 'nocall'],
      ['debug', 'nocall'],
      ['verbose', 'nocall']
    ],
    expectedNotCalled: ['debug', 'info'],
    expectedLastCalls: { error: 'error2', warn: 'warn2' }
  })

  runLevelCase({
    level: 'info',
    calls: [
      ['error', 'error3'],
      ['warn', 'warn3'],
      ['info', 'info3'],
      ['debug', 'nocall'],
      ['verbose', 'nocall']
    ],
    expectedNotCalled: ['debug'],
    expectedLastCalls: { error: 'error3', warn: 'warn3', info: 'info3' }
  })

  runLevelCase({
    level: 'verbose',
    calls: [
      ['error', 'error4'],
      ['warn', 'warn4'],
      ['info', 'info4'],
      ['verbose', 'verbose4'],
      ['debug', 'nocall']
    ],
    expectedLastCalls: { error: 'error4', warn: 'warn4', info: 'info4', debug: 'verbose4' }
  })

  runLevelCase({
    level: 'debug',
    calls: [
      ['error', 'error5'],
      ['warn', 'warn5'],
      ['info', 'info5'],
      ['verbose', 'verbose5'],
      ['debug', 'debug5']
    ],
    expectedLastCalls: { error: 'error5', warn: 'warn5', info: 'info5', debug: 'debug5' }
  })
})