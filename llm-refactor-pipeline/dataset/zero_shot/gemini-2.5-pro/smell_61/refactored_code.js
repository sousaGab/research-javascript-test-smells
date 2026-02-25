describe("FixedOffsetZone.parseSpecifier", () => {
  const invalidCases = [
    undefined,
    null,
    "",
    "foo",
    "UTC+blorp",
  ];

  test.each(invalidCases)("returns null for invalid specifier '%p'", (specifier) => {
    expect(FixedOffsetZone.parseSpecifier(specifier)).toBe(null);
  });
});