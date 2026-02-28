test("Interval#intersection returns null if there's no intersection", () => {
  expect(todayFrom(5, 8).intersection(todayFrom(3, 4))).toBeNull();
});