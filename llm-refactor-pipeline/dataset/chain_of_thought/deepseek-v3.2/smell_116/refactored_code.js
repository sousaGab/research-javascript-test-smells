test('custom levels', () => {
  const testCases = [
    {
      level: 'error',
      calls: [
        { method: 'error', message: 'error', shouldCall: true },
        { method: 'info', message: 'nocall', shouldCall: false },
        { method: 'warn', message: 'nocall', shouldCall: false },
        { method: 'debug', message: 'nocall', shouldCall: false },
        { method: 'verbose', message: 'nocall', shouldCall: false }
      ],
      expectations: [
        { method: 'warn', shouldBeCalled: false },
        { method: 'debug', shouldBeCalled: false },
        { method: 'info', shouldBeCalled: false },
        { method: 'error', shouldBeCalled: true, expectedMessage: 'error' }
      ]
    },
    {
      level: 'warn',
      calls: [
        { method: 'error', message: 'error2', shouldCall: true },
        { method: 'warn', message: 'warn2', shouldCall: true },
        { method: 'info', message: 'nocall', shouldCall: false },
        { method: 'debug', message: 'nocall', shouldCall: false },
        { method: 'verbose', message: 'nocall', shouldCall: false }
      ],
      expectations: [
        { method: 'debug', shouldBeCalled: false },
        { method: 'info', shouldBeCalled: false },
        { method: 'error', shouldBeCalled: true, expectedMessage: 'error2' },
        { method: 'warn', shouldBeCalled: true, expectedMessage: 'warn2' }
      ]
    },
    {
      level: 'info',
      calls: [
        { method: 'error', message: 'error3', shouldCall: true },
        { method: 'warn', message: 'warn3', shouldCall: true },
        { method: 'info', message: 'info3', shouldCall: true },
        { method: 'debug', message: 'nocall', shouldCall: false },
        { method: 'verbose', message: 'nocall', shouldCall: false }
      ],
      expectations: [
        { method: 'debug', shouldBeCalled: false },
        { method: 'error', shouldBeCalled: true, expectedMessage: 'error3' },
        { method: 'warn', shouldBeCalled: true, expectedMessage: 'warn3' },
        { method: 'info', shouldBeCalled: true, expectedMessage: 'info3' }
      ]
    },
    {
      level: 'verbose',
      calls: [
        { method: 'error', message: 'error4', shouldCall: true },
        { method: 'warn', message: 'warn4', shouldCall: true },
        { method: 'info', message: 'info4', shouldCall: true },
        { method: 'verbose', message: 'verbose4', shouldCall: true },
        { method: 'debug', message: 'nocall', shouldCall: false }
      ],
      expectations: [
        { method: 'error', shouldBeCalled: true, expectedMessage: 'error4' },
        { method: 'warn', shouldBeCalled: true, expectedMessage: 'warn4' },
        { method: 'info', shouldBeCalled: true, expectedMessage: 'info4' },
        { method: 'debug', shouldBeCalled: true, expectedMessage: 'verbose4' }
      ]
    },
    {
      level: 'debug',
      calls: [
        { method: 'error', message: 'error5', shouldCall: true },
        { method: 'warn', message: 'warn5', shouldCall: true },
        { method: 'info', message: 'info5', shouldCall: true },
        { method: 'verbose', message: 'verbose5', shouldCall: true },
        { method: 'debug', message: 'debug5', shouldCall: true }
      ],
      expectations: [
        { method: 'error', shouldBeCalled: true, expectedMessage: 'error5' },
        { method: 'warn', shouldBeCalled: true, expectedMessage: 'warn5' },
        { method: 'info', shouldBeCalled: true, expectedMessage: 'info5' },
        { method: 'debug', shouldBeCalled: true, expectedMessage: 'debug5' }
      ]
    }
  ]

  testCases.forEach((testCase) => {
    const logger = serverlessExpressLogger({ level: testCase.level })

    testCase.calls.forEach((call) => {
      if (call.shouldCall) {
        logger[call.method](call.message)
      }
    })

    testCase.expectations.forEach((expectation) => {
      if (expectation.shouldBeCalled) {
        expect(global.console[expectation.method]).toHaveBeenLastCalledWith({
          message: expectation.expectedMessage
        })
      } else {
        expect(global.console[expectation.method]).not.toHaveBeenCalled()
      }
    })
  })
})