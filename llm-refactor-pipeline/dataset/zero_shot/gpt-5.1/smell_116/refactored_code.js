test('custom levels', () => {
  const scenarios = [
    {
      level: 'error',
      calls: [
        { method: 'error', arg: 'error' },
        { method: 'info', arg: 'nocall' },
        { method: 'warn', arg: 'nocall' },
        { method: 'debug', arg: 'nocall' },
        { method: 'verbose', arg: 'nocall' }
      ],
      expectations: [
        { consoleMethod: 'warn', called: false },
        { consoleMethod: 'debug', called: false },
        { consoleMethod: 'info', called: false },
        {
          consoleMethod: 'error',
          called: true,
          lastCalledWith: { message: 'error' }
        }
      ]
    },
    {
      level: 'warn',
      calls: [
        { method: 'error', arg: 'error2' },
        { method: 'warn', arg: 'warn2' },
        { method: 'info', arg: 'nocall' },
        { method: 'debug', arg: 'nocall' },
        { method: 'verbose', arg: 'nocall' }
      ],
      expectations: [
        { consoleMethod: 'debug', called: false },
        { consoleMethod: 'info', called: false },
        {
          consoleMethod: 'error',
          called: true,
          lastCalledWith: { message: 'error2' }
        },
        {
          consoleMethod: 'warn',
          called: true,
          lastCalledWith: { message: 'warn2' }
        }
      ]
    },
    {
      level: 'info',
      calls: [
        { method: 'error', arg: 'error3' },
        { method: 'warn', arg: 'warn3' },
        { method: 'info', arg: 'info3' },
        { method: 'debug', arg: 'nocall' },
        { method: 'verbose', arg: 'nocall' }
      ],
      expectations: [
        { consoleMethod: 'debug', called: false },
        {
          consoleMethod: 'error',
          called: true,
          lastCalledWith: { message: 'error3' }
        },
        {
          consoleMethod: 'warn',
          called: true,
          lastCalledWith: { message: 'warn3' }
        },
        {
          consoleMethod: 'info',
          called: true,
          lastCalledWith: { message: 'info3' }
        }
      ]
    },
    {
      level: 'verbose',
      calls: [
        { method: 'error', arg: 'error4' },
        { method: 'warn', arg: 'warn4' },
        { method: 'info', arg: 'info4' },
        { method: 'verbose', arg: 'verbose4' },
        { method: 'debug', arg: 'nocall' }
      ],
      expectations: [
        {
          consoleMethod: 'error',
          called: true,
          lastCalledWith: { message: 'error4' }
        },
        {
          consoleMethod: 'warn',
          called: true,
          lastCalledWith: { message: 'warn4' }
        },
        {
          consoleMethod: 'info',
          called: true,
          lastCalledWith: { message: 'info4' }
        },
        {
          consoleMethod: 'debug',
          called: true,
          lastCalledWith: { message: 'verbose4' }
        }
      ]
    },
    {
      level: 'debug',
      calls: [
        { method: 'error', arg: 'error5' },
        { method: 'warn', arg: 'warn5' },
        { method: 'info', arg: 'info5' },
        { method: 'verbose', arg: 'verbose5' },
        { method: 'debug', arg: 'debug5' }
      ],
      expectations: [
        {
          consoleMethod: 'error',
          called: true,
          lastCalledWith: { message: 'error5' }
        },
        {
          consoleMethod: 'warn',
          called: true,
          lastCalledWith: { message: 'warn5' }
        },
        {
          consoleMethod: 'info',
          called: true,
          lastCalledWith: { message: 'info5' }
        },
        {
          consoleMethod: 'debug',
          called: true,
          lastCalledWith: { message: 'debug5' }
        }
      ]
    }
  ]

  scenarios.forEach(({ level, calls, expectations }) => {
    const logger = serverlessExpressLogger({ level })

    calls.forEach(({ method, arg }) => {
      logger[method](arg)
    })

    expectations.forEach(({ consoleMethod, called, lastCalledWith }) => {
      const consoleMock = global.console[consoleMethod]
      if (called === false) {
        expect(consoleMock).not.toHaveBeenCalled()
      } else {
        expect(consoleMock).toHaveBeenLastCalledWith(lastCalledWith)
      }
    })
  })
})