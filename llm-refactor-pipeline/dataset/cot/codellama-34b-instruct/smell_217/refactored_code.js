test("DateTime#toRFC2822() returns null for invalid DateTimes", () => {
  const invalidDateTime = new DateTime(null);
  expect(invalidDateTime.toRFC2822()).toBeNull();
})