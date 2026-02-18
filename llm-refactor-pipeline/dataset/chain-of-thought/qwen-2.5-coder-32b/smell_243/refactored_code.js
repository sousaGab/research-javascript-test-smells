it('should reset the mode to the original value', () => {
    nockBack.setMode(originalMode)
    expect(nockBack.getMode()).toBe(originalMode)
  })