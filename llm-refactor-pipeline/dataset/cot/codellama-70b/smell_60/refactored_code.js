test("Interval#intersection returns null if there's no intersection", () => {
  const interval = todayFrom(5, 8);
  const otherInterval = todayFrom(3, 4);
  expect(interval.intersection(otherInterval)).toBe(null);
})