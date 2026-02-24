it('that Logger class is exported', () => {
  const ExportedLogger = require('../../lib/winston/logger');
  expect(Logger).toBe(ExportedLogger);
});