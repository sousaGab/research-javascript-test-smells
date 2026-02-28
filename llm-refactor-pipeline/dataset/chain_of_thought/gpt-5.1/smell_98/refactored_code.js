describe('BvModalEvent', () => {
  it('creates a modal event with the given type and proper inheritance', async () => {
    const eventType = 'foobar'
    const event = new BvModalEvent(eventType)

    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe(eventType)
  })
})