it('should return correct breakpoints array and a new instance each call', () => {
  const expectedBreakpoints = ['', 'sm', 'md', 'lg', 'xl'];
  
  const firstCall = getBreakpointsUp();
  const secondCall = getBreakpointsUp();
  const thirdCall = getBreakpointsUp();
  
  expect(firstCall).toEqual(expectedBreakpoints);
  expect(secondCall).toEqual(expectedBreakpoints);
  expect(firstCall).not.toBe(secondCall);
  expect(secondCall).not.toBe(thirdCall);
});