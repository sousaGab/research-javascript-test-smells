test("DateTime#offsetNameLong returns null for invalid times", () => {
  const invalidDateTime = DateTime.invalid("because");
  expect(invalidDateTime.offsetNameLong).toBeNull();
});