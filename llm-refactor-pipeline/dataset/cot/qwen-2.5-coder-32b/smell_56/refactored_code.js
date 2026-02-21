it("returns null when verticalCompact is false", () => {
    const result = compactType(mockProps);
    expect(result).toBeNull();
  })