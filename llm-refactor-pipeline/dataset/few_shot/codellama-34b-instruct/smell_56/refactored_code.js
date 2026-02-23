// Your COMPLETE refactored test code here
it("returns null when verticalCompact is false", () => {
    const props = mockProps();
    props.verticalCompact = false;
    expect(compactType(props)).toBe(null);
  })