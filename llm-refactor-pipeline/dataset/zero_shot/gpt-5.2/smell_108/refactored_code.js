it('should return the expected breakpoints and a deep-cloned array', async () => {
  const breakpointsUpFirstCall = getBreakpointsUp()
  const breakpointsUpSecondCall = getBreakpointsUp()

  expect(breakpointsUpFirstCall).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  // Should return a deep clone
  expect(breakpointsUpFirstCall).not.toBe(breakpointsUpSecondCall)
})