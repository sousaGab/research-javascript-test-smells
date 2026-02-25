describe('getBreakpointsUp', () => {
  it('should return the correct list of breakpoints', () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl']);
  });

  it('should return a new array instance on each call', () => {
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp());
  });
});