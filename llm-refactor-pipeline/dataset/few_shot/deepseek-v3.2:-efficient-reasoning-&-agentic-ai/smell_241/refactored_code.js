it('that Logger class is exported', () => {
  const requiredLogger = require('../../lib/winston/logger');
  expect(Logger).toBe(requiredLogger);
})