it('should return breakpoints in correct order and as a deep clone', async () => {
  const result1 = getBreakpointsUp()
  const result2 = getBreakpointsUp()
  
  expect(result1).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result1).not.toBe(result2)
})