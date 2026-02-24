test("Interval#intersection returns null if there's no intersection", () => {
  const firstInterval = todayFrom(5, 8);
  const secondInterval = todayFrom(3, 4);

  const intersection = firstInterval.intersection(secondInterval);

  expect(intersection).toBeNull();
});