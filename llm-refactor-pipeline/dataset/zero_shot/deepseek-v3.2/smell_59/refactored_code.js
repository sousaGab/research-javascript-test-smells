test("DateTime#offsetNameLong returns null for invalid times", () => {
  const zoned = DateTime.invalid("because");
  expect(zoned.offsetNameLong).toBeNull();
});