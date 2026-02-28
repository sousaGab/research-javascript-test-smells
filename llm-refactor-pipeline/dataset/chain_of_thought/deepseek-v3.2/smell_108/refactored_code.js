it('getBreakpointsUp() works', async () => {
  const result1 = getBreakpointsUp();
  const result2 = getBreakpointsUp();
  
  expect(result1).toEqual(['', 'sm', 'md', 'lg', 'xl']);
  expect(result2).not.toBe(result1);
});