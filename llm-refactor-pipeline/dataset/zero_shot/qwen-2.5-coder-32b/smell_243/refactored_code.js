it('should be able to reset the mode', () => {
    const initialMode = nockBack.getMode();
    nockBack.setMode(originalMode);
    expect(nockBack.getMode()).toBe(originalMode);
  })