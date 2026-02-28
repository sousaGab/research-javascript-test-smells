test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  const invalidData = [
    undefined,
    null,
    "",
    "foo",
    "UTC+blorp"
  ];

  invalidData.forEach((data) => {
    expect(FixedOffsetZone.parseSpecifier(data)).toBe(null);
  });
})