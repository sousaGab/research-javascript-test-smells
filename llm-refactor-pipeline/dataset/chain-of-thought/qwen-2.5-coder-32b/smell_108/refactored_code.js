it('returns breakpoints in correct order', async () => {
  const result = getBreakpointsUp()
  expect(result).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result).not.toBe(getBreakpointsUp())
})