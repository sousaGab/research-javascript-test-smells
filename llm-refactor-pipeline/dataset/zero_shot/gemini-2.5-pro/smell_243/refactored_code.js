it('should be able to reset the mode', () => {
  nockBack.setMode(originalMode);
  expect(nockBack.currentMode).to.equal(originalMode);
});