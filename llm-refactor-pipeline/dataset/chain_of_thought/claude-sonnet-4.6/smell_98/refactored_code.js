it('BvModalEvent should be an instance of BvModalEvent and BvEvent with the correct type', async () => {
    const event = new BvModalEvent('foobar')
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe('foobar')
  })