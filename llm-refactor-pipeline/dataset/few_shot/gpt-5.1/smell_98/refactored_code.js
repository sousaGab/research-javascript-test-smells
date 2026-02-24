it('creates a BvModalEvent with correct type and inheritance', async () => {
  const eventType = 'foobar'
  const event = new BvModalEvent(eventType)

  expect(event).toBeInstanceOf(BvModalEvent)
  expect(event).toBeInstanceOf(BvEvent)
  expect(event.type).toBe(eventType)
})