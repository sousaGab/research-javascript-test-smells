test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  expect(FixedOffsetZone.parseSpecifier()).toBe(null, "Expected null for empty specifier");
  expect(FixedOffsetZone.parseSpecifier(null)).toBe(null, "Expected null for null specifier");
  expect(FixedOffsetZone.parseSpecifier("")).toBe(null, "Expected null for empty string specifier");
  expect(FixedOffsetZone.parseSpecifier("foo")).toBe(null, "Expected null for invalid specifier");
  expect(FixedOffsetZone.parseSpecifier("UTC+blorp")).toBe(null, "Expected null for invalid specifier");
})