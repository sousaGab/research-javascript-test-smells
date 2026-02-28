test("DateTime#toRFC2822() returns null for invalid DateTimes", () => {
  const result = invalid.toRFC2822();
  expect(result).toBeNull();
});