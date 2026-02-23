test("Interval#intersection returns null if there's no intersection", () => {
  const intervalA = todayFrom(5, 8);
  const intervalB = todayFrom(3, 4);

  const intersection = intervalA.intersection(intervalB);

  expect(intersection).toBeNull();
});