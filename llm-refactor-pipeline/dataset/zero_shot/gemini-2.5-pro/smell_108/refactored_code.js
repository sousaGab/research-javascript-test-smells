describe('getBreakpointsUp', () => {
  it('should return all breakpoint names in ascending order', () => {
    expect(getBreakpointsUp()).toEqual(['', 'sm', 'md', 'lg', 'xl']);
  });

  it('should return a new array instance on each call', () => {
    expect(getBreakpointsUp()).not.toBe(getBreakpointsUp());
  });
});