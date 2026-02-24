it('getBreakpointsUp() returns expected breakpoint list and deep clone', async () => {
  const expectedBreakpoints = ['', 'sm', 'md', 'lg', 'xl']

  const firstCallResult = getBreakpointsUp()
  const secondCallResult = getBreakpointsUp()

  expect(firstCallResult).toEqual(expectedBreakpoints)
  expect(firstCallResult).not.toBe(secondCallResult)
})