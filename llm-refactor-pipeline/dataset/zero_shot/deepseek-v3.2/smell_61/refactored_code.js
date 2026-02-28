test.each([
  [undefined],
  [null],
  [""],
  ["foo"],
  ["UTC+blorp"]
])("FixedOffsetZone.parseSpecifier returns null for invalid data: %p", (input) => {
  expect(FixedOffsetZone.parseSpecifier(input)).toBe(null);
});