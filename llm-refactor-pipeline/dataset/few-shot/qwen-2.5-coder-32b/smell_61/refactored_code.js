test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  const invalidInputs = [undefined, null, "", "foo", "UTC+blorp"];
  
  invalidInputs.forEach(input => {
    expect(FixedOffsetZone.parseSpecifier(input)).toBeNull();
  });
});