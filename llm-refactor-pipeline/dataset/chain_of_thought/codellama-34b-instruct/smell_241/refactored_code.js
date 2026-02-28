// Your COMPLETE refactored test code here

it('that Logger class is exported', () => {
    const Logger = require('../../lib/winston/logger');
    expect(Logger).toBeDefined();
  })