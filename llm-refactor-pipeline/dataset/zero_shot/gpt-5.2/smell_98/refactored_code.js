it('creates a BvModalEvent with the provided type and correct inheritance', async () => {
  const eventType = 'foobar'
  const event = new BvModalEvent(eventType)

  expect(event).toBeInstanceOf(BvModalEvent)
  expect(event).toBeInstanceOf(BvEvent)
  expect(event.type).toBe(eventType)
})