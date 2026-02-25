describe('getBreakpointsUp()', () => {
  it('returns an array of breakpoints', () => {
    const breakpoints = getBreakpointsUp();
    expect(breakpoints).toEqual(['', 'sm', 'md', 'lg', 'xl']);
  });

  it('returns a deep clone', () => {
    const breakpoints1 = getBreakpointsUp();
    const breakpoints2 = getBreakpointsUp();
    expect(breakpoints1).not.toBe(breakpoints2);
  });
});