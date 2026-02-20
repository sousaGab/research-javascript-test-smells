it('getBreakpointsUp() returns correct breakpoints array and deep clones result', async () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl'])
    // Should return a deep clone
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp())
  })