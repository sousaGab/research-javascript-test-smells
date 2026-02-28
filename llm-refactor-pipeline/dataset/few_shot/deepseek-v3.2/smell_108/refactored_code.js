it('getBreakpointsUp() works', async () => {
  const result1 = getBreakpointsUp()
  const result2 = getBreakpointsUp()
  
  expect(result1).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result2).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  expect(result1).not.toBe(result2)
})