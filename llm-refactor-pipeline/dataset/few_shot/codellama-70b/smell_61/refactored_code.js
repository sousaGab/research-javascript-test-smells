test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  const invalidData = [undefined, null, "", "foo", "UTC+blorp"];
  for (const data of invalidData) {
    expect(FixedOffsetZone.parseSpecifier(data)).toBe(null);
  }
})