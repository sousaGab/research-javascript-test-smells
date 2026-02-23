test('custom levels', () => {
  const levelConfigs = [
    {
      level: 'error',
      calls: { error: 'error', warn: null, info: null, debug: null, verbose: null },
      expectations: {
        called: { error: 'error' },
        notCalled: ['warn', 'debug', 'info']
      }
    },
    {
      level: 'warn',
      calls: { error: 'error2', warn: 'warn2', info: null, debug: null, verbose: null },
      expectations: {
        called: { error: 'error2', warn: 'warn2' },
        notCalled: ['debug', 'info']
      }
    },
    {
      level: 'info',
      calls: { error: 'error3', warn: 'warn3', info: 'info3', debug: null, verbose: null },
      expectations: {
        called: { error: 'error3', warn: 'warn3', info: 'info3' },
        notCalled: ['debug']
      }
    },
    {
      level: 'verbose',
      calls: { error: 'error4', warn: 'warn4', info: 'info4', verbose: 'verbose4', debug: null },
      expectations: {
        called: { error: 'error4', warn: 'warn4', info: 'info4', debug: 'verbose4' },
        notCalled: []
      }
    },
    {
      level: 'debug',
      calls: { error: 'error5', warn: 'warn5', info: 'info5', verbose: 'verbose5', debug: 'debug5' },
      expectations: {
        called: { error: 'error5', warn: 'warn5', info: 'info5', debug: 'debug5' },
        notCalled: []
      }
    }
  ]

  const consoleMethodMap = { error: 'error', warn: 'warn', info: 'info', debug: 'debug' }

  for (const config of levelConfigs) {
    const logger = serverlessExpressLogger({ level: config.level })

    if (config.calls.error) logger.error(config.calls.error)
    else logger.error('nocall')
    if (config.calls.warn) logger.warn(config.calls.warn)
    else logger.warn('nocall')
    if (config.calls.info) logger.info(config.calls.info)
    else logger.info('nocall')
    if (config.calls.verbose) logger.verbose(config.calls.verbose)
    else logger.verbose('nocall')
    if (config.calls.debug) logger.debug(config.calls.debug)
    else logger.debug('nocall')

    for (const method of config.expectations.notCalled) {
      expect(global.console[consoleMethodMap[method]]).not.toHaveBeenCalled()
    }

    for (const [method, message] of Object.entries(config.expectations.called)) {
      expect(global.console[consoleMethodMap[method]]).toHaveBeenLastCalledWith({ message })
    }
  }
})