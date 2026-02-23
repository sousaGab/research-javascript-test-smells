test("Interval#intersection returns null if there's no intersection", () => {
  const intersection = todayFrom(5, 8).intersection(todayFrom(3, 4));
  expect(intersection).toBeNull();
});