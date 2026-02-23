// Your COMPLETE refactored test code here

it('should be able to reset the mode', () => {
    nockBack.setMode(originalMode)
    const mode = nockBack.getMode();
    expect(mode).toBe(originalMode);
  })