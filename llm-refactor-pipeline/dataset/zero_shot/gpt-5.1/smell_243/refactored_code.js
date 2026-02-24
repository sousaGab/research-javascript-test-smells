it('should be able to reset the mode', () => {
  const previousMode = nockBack.currentMode || nockBack.getMode?.();

  nockBack.setMode(originalMode);

  const currentMode = nockBack.currentMode || nockBack.getMode?.();
  expect(currentMode).toEqual(originalMode);

  // restore previous mode to avoid side effects
  if (previousMode !== undefined) {
    nockBack.setMode(previousMode);
  }
})