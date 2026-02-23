test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  [undefined, null, "", "foo", "UTC+blorp"].forEach((input) => {
    expect(FixedOffsetZone.parseSpecifier(input)).toBe(null);
  });
});