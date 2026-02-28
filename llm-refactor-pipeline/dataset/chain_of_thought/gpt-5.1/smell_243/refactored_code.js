it('should be able to reset the mode', () => {
  // change mode to something else first to ensure reset is meaningful
  nockBack.setMode('record');

  // reset to original mode
  nockBack.setMode(originalMode);

  // verify that mode was actually reset
  expect(nockBack.currentMode || nockBack.mode).toBe(originalMode);
})