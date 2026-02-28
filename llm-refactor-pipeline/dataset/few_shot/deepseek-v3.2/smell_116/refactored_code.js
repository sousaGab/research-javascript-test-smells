test('custom levels', () => {
  const levels = [
    { level: 'error', calls: ['error'], nocalls: ['info', 'warn', 'debug', 'verbose'] },
    { level: 'warn', calls: ['error', 'warn'], nocalls: ['info', 'debug', 'verbose'] },
    { level: 'info', calls: ['error', 'warn', 'info'], nocalls: ['debug', 'verbose'] },
    { level: 'verbose', calls: ['error', 'warn', 'info', 'verbose'], nocalls: ['debug'] },
    { level: 'debug', calls: ['error', 'warn', 'info', 'verbose', 'debug'], nocalls: [] }
  ]

  levels.forEach((config, index) => {
    const logger = serverlessExpressLogger({ level: config.level })
    const suffix = index + 1

    config.calls.forEach(method => {
      const message = `${method}${suffix}`
      logger[method](message)
      expect(global.console[method]).toHaveBeenLastCalledWith({ message })
    })

    config.nocalls.forEach(method => {
      logger[method]('nocall')
      expect(global.console[method]).not.toHaveBeenCalled()
    })
  })
})