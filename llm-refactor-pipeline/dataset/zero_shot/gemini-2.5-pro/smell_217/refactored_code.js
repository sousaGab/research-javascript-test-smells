test("DateTime#toRFC2822() returns null for invalid DateTimes", () => {
  expect(invalid.toRFC2822()).toBeNull();
});