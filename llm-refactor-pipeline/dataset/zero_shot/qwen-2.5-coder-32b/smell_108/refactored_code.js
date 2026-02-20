it('getBreakpointsUp() works', async () => {
    const result1 = getBreakpointsUp()
    const result2 = getBreakpointsUp()
    
    expect(result1).toEqual(['', 'sm', 'md', 'lg', 'xl'])
    // Should return a deep clone
    expect(result1).not.toBe(result2)
  })