test('custom levels', () => {
  const scenarios = [
    {
      level: 'error',
      calls: [
        { method: 'error', message: 'error' },
        { method: 'info', message: 'nocall' },
        { method: 'warn', message: 'nocall' },
        { method: 'debug', message: 'nocall' },
        { method: 'verbose', message: 'nocall' }
      ],
      expectations: {
        error: { calledWith: { message: 'error' } },
        warn: { notCalled: true },
        info: { notCalled: true },
        debug: { notCalled: true }
      }
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
      expectations: {
        error: { calledWith: { message: 'error2' } },
        warn: { calledWith: { message: 'warn2' } },
        info: { notCalled: true },
        debug: { notCalled: true }
      }
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
      expectations: {
        error: { calledWith: { message: 'error3' } },
        warn: { calledWith: { message: 'warn3' } },
        info: { calledWith: { message: 'info3' } },
        debug: { notCalled: true }
      }
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
      expectations: {
        error: { calledWith: { message: 'error4' } },
        warn: { calledWith: { message: 'warn4' } },
        info: { calledWith: { message: 'info4' } },
        debug: { calledWith: { message: 'verbose4' } }
      }
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
      expectations: {
        error: { calledWith: { message: 'error5' } },
        warn: { calledWith: { message: 'warn5' } },
        info: { calledWith: { message: 'info5' } },
        debug: { calledWith: { message: 'debug5' } }
      }
    }
  ]

  const consoleMethods = ['error', 'warn', 'info', 'debug']

  scenarios.forEach(({ level, calls, expectations }) => {
    const logger = serverlessExpressLogger({ level })

    calls.forEach(({ method, message }) => {
      logger[method](message)
    })

    consoleMethods.forEach(method => {
      const expectation = expectations[method]
      if (!expectation) return

      if (expectation.notCalled) {
        expect(global.console[method]).not.toHaveBeenCalled()
      } else if (expectation.calledWith) {
        expect(global.console[method]).toHaveBeenLastCalledWith(
          expectation.calledWith
        )
      }
    })
  })
})