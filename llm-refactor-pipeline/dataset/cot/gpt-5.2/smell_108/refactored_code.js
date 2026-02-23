it('should return the expected breakpoints and a deep-cloned array', async () => {
  const expectedBreakpoints = ['', 'sm', 'md', 'lg', 'xl']

  const firstResult = getBreakpointsUp()
  const secondResult = getBreakpointsUp()

  expect(firstResult).toEqual(expectedBreakpoints)
  expect(secondResult).toEqual(expectedBreakpoints)

  // Should return a deep clone
  expect(firstResult).not.toBe(secondResult)
})