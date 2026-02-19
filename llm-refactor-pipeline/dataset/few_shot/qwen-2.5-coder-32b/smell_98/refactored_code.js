it('creates a BvModalEvent with correct type', async () => {
    const event = new BvModalEvent('foobar')
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe('foobar')
  })