test("Interval#intersection returns null if there's no intersection", () => {
  const interval1 = todayFrom(5, 8);
  const interval2 = todayFrom(3, 4);
  const result = interval1.intersection(interval2);
  expect(result).toBeNull();
});