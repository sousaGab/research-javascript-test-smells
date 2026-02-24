it('exports the Logger class from ../../lib/winston/logger', () => {
  const exportedLogger = require('../../lib/winston/logger');
  expect(Logger).toBe(exportedLogger);
});