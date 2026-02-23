// Your COMPLETE refactored test code here
it('should be able to reset the mode', () => {
    nockBack.setMode(originalMode)
    expect(nockBack.getMode()).toBe(originalMode)
  })