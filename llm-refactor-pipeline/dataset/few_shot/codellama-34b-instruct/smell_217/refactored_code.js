test("DateTime#toRFC2822() returns null for invalid DateTimes", () => {
  const invalidDateTime = new DateTime(NaN);
  expect(invalidDateTime.toRFC2822()).toBe(null);
})