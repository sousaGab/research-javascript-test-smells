test.each([
  undefined,
  null,
  "",
  "foo",
  "UTC+blorp",
])("FixedOffsetZone.parseSpecifier returns null for invalid specifier: %p", (specifier) => {
  expect(FixedOffsetZone.parseSpecifier(specifier)).toBe(null);
});