it('that Logger class is exported', () => {
    const exportedLogger = require('../../lib/winston/logger');
    expect(Logger).toBe(exportedLogger);
  })