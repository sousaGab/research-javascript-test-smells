it("returns null when verticalCompact is false", () => {
    const { verticalCompact } = mockProps;
    expect(compactType(verticalCompact)).toBe(null);
  })