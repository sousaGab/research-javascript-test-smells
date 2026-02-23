it('getBreakpointsUp() returns expected breakpoints and a deep-cloned array', async () => {
  const expectedBreakpointsUp = ['', 'sm', 'md', 'lg', 'xl']

  const firstResult = getBreakpointsUp()
  expect(firstResult).toEqual(expectedBreakpointsUp)

  const secondResult = getBreakpointsUp()
  expect(secondResult).toEqual(expectedBreakpointsUp)

  expect(firstResult).not.toBe(secondResult)
})