it('returns correct breakpoints array and deep clones the result', async () => {
  const result = getBreakpointsUp()
  expect(result).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result).not.toBe(getBreakpointsUp())
})