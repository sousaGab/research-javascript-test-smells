it('that Logger class is exported', () => {
  const expectedLogger = require('../../lib/winston/logger');
  expect(Logger).toBe(expectedLogger);
})