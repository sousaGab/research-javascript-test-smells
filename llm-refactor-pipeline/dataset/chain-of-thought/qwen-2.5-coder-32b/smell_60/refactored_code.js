test("Interval#intersection returns null when intervals do not overlap", () => {
  const interval1 = todayFrom(5, 8);
  const interval2 = todayFrom(3, 4);
  const result = interval1.intersection(interval2);
  expect(result).toBeNull();
});