it('instantiates with correct type and inherits from BvEvent', async () => {
  const event = new BvModalEvent('foobar')
  expect(event).toBeInstanceOf(BvModalEvent)
  expect(event).toBeInstanceOf(BvEvent)
  expect(event.type).toBe('foobar')
})