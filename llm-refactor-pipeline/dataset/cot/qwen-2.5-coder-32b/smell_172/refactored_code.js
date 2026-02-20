it('throws exception if no type given', async () => {
  await expect(async () => {
    new BvEvent()
  }).rejects.toThrow()
})