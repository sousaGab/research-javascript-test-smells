// Your COMPLETE refactored test code here
it('that Logger class is exported', () => {
    expect(Logger).toBe(require('../../lib/winston/logger'));
  })