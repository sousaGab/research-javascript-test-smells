it('should export the Logger class', () => {
    const { Logger } = require('../../lib/winston/logger');
    expect(Logger).toBeDefined();
  })