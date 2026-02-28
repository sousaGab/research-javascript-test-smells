// Your COMPLETE refactored test code here
it('works', async () => {
    const event = new BvModalEvent('foobar')
    expect(event).toBeInstanceOf(BvModalEvent)
    expect(event).toBeInstanceOf(BvEvent)
    expect(event.type).toBe('foobar')
  })