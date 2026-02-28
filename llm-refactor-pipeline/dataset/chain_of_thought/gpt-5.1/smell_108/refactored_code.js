describe('getBreakpointsUp', () => {
  it('returns all breakpoints in ascending order', async () => {
    const expectedBreakpoints = ['', 'sm', 'md', 'lg', 'xl']

    const result = getBreakpointsUp()

    expect(result).toEqual(expectedBreakpoints)
  })

  it('returns a deep cloned array on each call', async () => {
    const firstResult = getBreakpointsUp()
    const secondResult = getBreakpointsUp()

    expect(firstResult).not.toBe(secondResult)
    expect(firstResult).toEqual(secondResult)
  })
})