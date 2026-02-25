it('that Logger class is exported', () => {
  // eslint-disable-next-line global-require
  expect(Logger).to.equal(require('../../lib/winston/logger'));
});