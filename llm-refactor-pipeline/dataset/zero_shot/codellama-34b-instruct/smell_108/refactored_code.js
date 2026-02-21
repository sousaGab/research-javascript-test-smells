it('should return a deep clone of the breakpoints array', async () => {
    const breakpoints = getBreakpointsUp();
    expect(breakpoints).toEqual(['', 'sm', 'md', 'lg', 'xl']);
    expect(breakpoints).not.toBe(getBreakpointsUp());
  })