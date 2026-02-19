test("Interval#intersection returns null if there's no intersection", () => {
  const result = todayFrom(5, 8).intersection(todayFrom(3, 4));
  expect(result).toBeNull();
})