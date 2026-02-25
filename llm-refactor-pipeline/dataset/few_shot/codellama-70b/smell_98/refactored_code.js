it('should create a BvModalEvent instance', async () => {
    const event = new BvModalEvent('foobar')
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe('foobar')
  })