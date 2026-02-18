test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  const invalidInputs = [undefined, null, "", "foo", "UTC+blorp"];
  
  for (const input of invalidInputs) {
    expect(FixedOffsetZone.parseSpecifier(input)).toBe(null);
  }
})