it('should be able to reset the mode', () => {
  const previousMode = nockBack.currentMode || originalMode;

  nockBack.setMode('record');
  expect(nockBack.currentMode).toBe('record');

  nockBack.setMode(originalMode);
  expect(nockBack.currentMode).toBe(originalMode);

  // restore previous mode to avoid side effects on other tests
  nockBack.setMode(previousMode);
});