it('that Logger class is exported', () => {
    const logger = require('../../lib/winston/logger');
    expect(Logger).toBe(logger);
  })