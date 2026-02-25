test("DateTime.invalid creates an invalid instance", () => {
  const zoned = DateTime.invalid("because");
  expect(zoned.isValid).toBe(false);
});