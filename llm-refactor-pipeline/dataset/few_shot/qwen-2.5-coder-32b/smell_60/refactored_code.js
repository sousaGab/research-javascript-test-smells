test("Interval#intersection returns null when intervals don't overlap", () => {
  const interval1 = todayFrom(5, 8);
  const interval2 = todayFrom(3, 4);
  expect(interval1.intersection(interval2)).toBeNull();
});