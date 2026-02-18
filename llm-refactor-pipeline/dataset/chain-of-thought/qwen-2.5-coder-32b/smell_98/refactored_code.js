it('creates a modal event with correct type and inheritance', async () => {
    const event = new BvModalEvent('foobar')
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe('foobar')
  })