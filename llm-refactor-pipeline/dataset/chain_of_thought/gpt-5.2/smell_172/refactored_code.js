// Your COMPLETE refactored test code here
it('throws exception if no type given', async () => {
  expect(() => new BvEvent()).toThrow()
})