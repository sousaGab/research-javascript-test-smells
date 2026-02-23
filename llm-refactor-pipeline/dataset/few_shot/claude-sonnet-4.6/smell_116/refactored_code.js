test('custom levels', () => {
  const testCases = [
    {
      level: 'error',
      calls: [
        { method: 'error', message: 'error' },
        { method: 'info', message: 'nocall' },
        { method: 'warn', message: 'nocall' },
        { method: 'debug', message: 'nocall' },
        { method: 'verbose', message: 'nocall' }
      ],
      notCalled: ['warn', 'debug', 'info'],
      lastCalled: [{ console: 'error', message: 'error' }]
    },
    {
      level: 'warn',
      calls: [
        { method: 'error', message: 'error2' },
        { method: 'warn', message: 'warn2' },
        { method: 'info', message: 'nocall' },
        { method: 'debug', message: 'nocall' },
        { method: 'verbose', message: 'nocall' }
      ],
      notCalled: ['debug', 'info'],
      lastCalled: [
        { console: 'error', message: 'error2' },
        { console: 'warn', message: 'warn2' }
      ]
    },
    {
      level: 'info',
      calls: [
        { method: 'error', message: 'error3' },
        { method: 'warn', message: 'warn3' },
        { method: 'info', message: 'info3' },
        { method: 'debug', message: 'nocall' },
        { method: 'verbose', message: 'nocall' }
      ],
      notCalled: ['debug'],
      lastCalled: [
        { console: 'error', message: 'error3' },
        { console: 'warn', message: 'warn3' },
        { console: 'info', message: 'info3' }
      ]
    },
    {
      level: 'verbose',
      calls: [
        { method: 'error', message: 'error4' },
        { method: 'warn', message: 'warn4' },
        { method: 'info', message: 'info4' },
        { method: 'verbose', message: 'verbose4' },
        { method: 'debug', message: 'nocall' }
      ],
      notCalled: [],
      lastCalled: [
        { console: 'error', message: 'error4' },
        { console: 'warn', message: 'warn4' },
        { console: 'info', message: 'info4' },
        { console: 'debug', message: 'verbose4' }
      ]
    },
    {
      level: 'debug',
      calls: [
        { method: 'error', message: 'error5' },
        { method: 'warn', message: 'warn5' },
        { method: 'info', message: 'info5' },
        { method: 'verbose', message: 'verbose5' },
        { method: 'debug', message: 'debug5' }
      ],
      notCalled: [],
      lastCalled: [
        { console: 'error', message: 'error5' },
        { console: 'warn', message: 'warn5' },
        { console: 'info', message: 'info5' },
        { console: 'debug', message: 'debug5' }
      ]
    }
  ]

  for (const { level, calls, notCalled, lastCalled } of testCases) {
    const logger = serverlessExpressLogger({ level })

    for (const { method, message } of calls) {
      logger[method](message)
    }

    for (const consoleMethod of notCalled) {
      expect(global.console[consoleMethod]).not.toHaveBeenCalled()
    }

    for (const { console: consoleMethod, message } of lastCalled) {
      expect(global.console[consoleMethod]).toHaveBeenLastCalledWith({ message })
    }
  }
})