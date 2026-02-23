// Your COMPLETE refactored test code here
it("returns null when verticalCompact is false", () => {
    const { verticalCompact } = mockProps;
    expect(compactType(mockProps)).toBe(null);
    expect(verticalCompact).toBe(false);
  })