it('creates a BvModalEvent with the provided type', async () => {
  const type = 'foobar'
  const event = new BvModalEvent(type)

  expect(event).toBeInstanceOf(BvModalEvent)
  expect(event).toBeInstanceOf(BvEvent)
  expect(event.type).toBe(type)
})