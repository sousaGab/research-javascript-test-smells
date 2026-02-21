it('getBreakpointsUp() works', async () => {
    const breakpoints = getBreakpointsUp();
    expect(breakpoints).toEqual(['', 'sm', 'md', 'lg', 'xl']);
    // Should return a deep clone
    expect(breakpoints).not.toBe(getBreakpointsUp());
  })