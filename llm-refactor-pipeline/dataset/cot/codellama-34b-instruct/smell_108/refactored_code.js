// Your COMPLETE refactored test code here

it('getBreakpointsUp() works', async () => {
    const breakpoints = getBreakpointsUp();
    expect(breakpoints).toEqual(['', 'sm', 'md', 'lg', 'xl']);
    expect(breakpoints).not.toBe(getBreakpointsUp());
  })