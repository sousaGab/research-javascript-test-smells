it('throws exception if no type given', async () => {
    let event = null
    expect(() => new BvModalEvent()).toThrow()
    expect(event).toBe(null)
  })