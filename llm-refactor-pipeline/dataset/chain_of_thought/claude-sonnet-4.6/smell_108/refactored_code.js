it('getBreakpointsUp() returns the correct breakpoints array', async () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl'])
  })

  it('getBreakpointsUp() returns a deep clone each time', async () => {
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp())
  })