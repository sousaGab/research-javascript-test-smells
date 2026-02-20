test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  expect(FixedOffsetZone.parseSpecifier()).toBeNull();
  expect(FixedOffsetZone.parseSpecifier(null)).toBeNull();
  expect(FixedOffsetZone.parseSpecifier("")).toBeNull();
  expect(FixedOffsetZone.parseSpecifier("foo")).toBeNull();
  expect(FixedOffsetZone.parseSpecifier("UTC+blorp")).toBeNull();
})