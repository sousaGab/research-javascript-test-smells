test('custom levels', () => {
  const testCases = [
    {
      level: 'error',
      calls: { error: 'error', warn: null, info: null, debug: null },
      notCalled: ['warn', 'debug', 'info']
    },
    {
      level: 'warn',
      calls: { error: 'error2', warn: 'warn2', info: null, debug: null },
      notCalled: ['debug', 'info']
    },
    {
      level: 'info',
      calls: { error: 'error3', warn: 'warn3', info: 'info3', debug: null },
      notCalled: ['debug']
    },
    {
      level: 'verbose',
      calls: { error: 'error4', warn: 'warn4', info: 'info4', debug: 'verbose4' },
      notCalled: []
    },
    {
      level: 'debug',
      calls: { error: 'error5', warn: 'warn5', info: 'info5', debug: 'debug5' },
      notCalled: []
    }
  ]

  const logMethods = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    verbose: 'verbose',
    debug: 'debug'
  }

  testCases.forEach(({ level, calls, notCalled }) => {
    jest.clearAllMocks()

    const logger = serverlessExpressLogger({ level })

    logger.error(calls.error || 'nocall')
    logger.warn(calls.warn || 'nocall')
    logger.info(calls.info || 'nocall')
    logger.verbose(calls.debug && level === 'verbose' ? calls.debug : 'nocall')
    logger.debug(calls.debug && level === 'debug' ? calls.debug : 'nocall')

    notCalled.forEach((method) => {
      expect(global.console[method]).not.toHaveBeenCalled()
    })

    if (calls.error) {
      expect(global.console.error).toHaveBeenLastCalledWith({ message: calls.error })
    }
    if (calls.warn) {
      expect(global.console.warn).toHaveBeenLastCalledWith({ message: calls.warn })
    }
    if (calls.info) {
      expect(global.console.info).toHaveBeenLastCalledWith({ message: calls.info })
    }
    if (calls.debug) {
      expect(global.console.debug).toHaveBeenLastCalledWith({ message: calls.debug })
    }
  })
})