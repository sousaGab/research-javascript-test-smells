it('returns correct breakpoints array and ensures deep clone', async () => {
  const result = getBreakpointsUp()
  expect(result).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result).not.toBe(getBreakpointsUp())
})