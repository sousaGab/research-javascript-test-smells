it('should instantiate with the correct type and class hierarchy', async () => {
  const event = new BvModalEvent('foobar')
  expect(event).toBeInstanceOf(BvModalEvent)
  expect(event).toBeInstanceOf(BvEvent)
  expect(event.type).toBe('foobar')
})