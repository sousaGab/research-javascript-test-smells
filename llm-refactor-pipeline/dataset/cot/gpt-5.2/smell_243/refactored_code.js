it('should be able to reset the mode', () => {
  nockBack.setMode(originalMode);
  expect(nockBack.mode).toBe(originalMode);
});