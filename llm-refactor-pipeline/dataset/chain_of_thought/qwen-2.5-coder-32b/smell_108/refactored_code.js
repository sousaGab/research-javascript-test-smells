describe('getBreakpointsUp()', () => {
  it('returns the correct breakpoints array', () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  })

  it('returns a deep clone of the breakpoints array', () => {
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp())
  })
})