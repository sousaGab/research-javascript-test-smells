it('should return a deep cloned list of breakpoints in ascending order', async function getBreakpointsUpWorks() {
  const expectedBreakpoints = ['', 'sm', 'md', 'lg', 'xl']
  const firstCallResult = getBreakpointsUp()
  const secondCallResult = getBreakpointsUp()

  expect(firstCallResult).toEqual(expectedBreakpoints)
  // Should return a deep clone
  expect(firstCallResult).not.toBe(secondCallResult)
})