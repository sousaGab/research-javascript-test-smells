// Your COMPLETE refactored test code here

describe('getBreakpointsUp()', () => {
    it('returns a deep clone of the breakpoints array', () => {
        const breakpoints = getBreakpointsUp();
        expect(breakpoints).toEqual(['', 'sm', 'md', 'lg', 'xl']);
        expect(breakpoints).not.toBe(getBreakpointsUp());
    });
});