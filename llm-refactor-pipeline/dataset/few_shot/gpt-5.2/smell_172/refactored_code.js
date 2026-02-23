it('throws exception if no type given', async () => {
  expect(() => new BvEvent()).toThrow()
  expect(() => new BvEvent()).not.toReturn()
})