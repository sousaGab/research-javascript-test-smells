it("returns null when verticalCompact is false", () => {
    const mockProps = {
        verticalCompact: false
    };
    expect(compactType(mockProps)).toBe(null);
});