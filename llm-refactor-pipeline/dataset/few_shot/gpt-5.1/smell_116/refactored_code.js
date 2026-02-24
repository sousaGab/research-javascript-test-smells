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
        { consoleMethod: 'warn', matcher: 'not.toHaveBeenCalled' },
        { consoleMethod: 'debug', matcher: 'not.toHaveBeenCalled' },
        { consoleMethod: 'info', matcher: 'not.toHaveBeenCalled' },
        {
          consoleMethod: 'error',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'error' }
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
        { consoleMethod: 'debug', matcher: 'not.toHaveBeenCalled' },
        { consoleMethod: 'info', matcher: 'not.toHaveBeenCalled' },
        {
          consoleMethod: 'error',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'error2' }
        },
        {
          consoleMethod: 'warn',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'warn2' }
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
        { consoleMethod: 'debug', matcher: 'not.toHaveBeenCalled' },
        {
          consoleMethod: 'error',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'error3' }
        },
        {
          consoleMethod: 'warn',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'warn3' }
        },
        {
          consoleMethod: 'info',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'info3' }
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
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'error4' }
        },
        {
          consoleMethod: 'warn',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'warn4' }
        },
        {
          consoleMethod: 'info',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'info4' }
        },
        {
          consoleMethod: 'debug',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'verbose4' }
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
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'error5' }
        },
        {
          consoleMethod: 'warn',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'warn5' }
        },
        {
          consoleMethod: 'info',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'info5' }
        },
        {
          consoleMethod: 'debug',
          matcher: 'toHaveBeenLastCalledWith',
          payload: { message: 'debug5' }
        }
      ]
    }
  ]

  scenarios.forEach(({ level, calls, expectations }) => {
    const logger = serverlessExpressLogger({ level })

    calls.forEach(({ method, arg }) => {
      logger[method](arg)
    })

    expectations.forEach(({ consoleMethod, matcher, payload }) => {
      const expectation = expect(global.console[consoleMethod])
      if (matcher === 'not.toHaveBeenCalled') {
        expectation.not.toHaveBeenCalled()
      } else if (matcher === 'toHaveBeenLastCalledWith') {
        expectation.toHaveBeenLastCalledWith(payload)
      }
    })
  })
})