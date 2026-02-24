test("Interval#intersection returns null if there's no intersection", () => {
  const intervalWithoutIntersection = todayFrom(5, 8);
  const nonOverlappingInterval = todayFrom(3, 4);

  const intersectionResult = intervalWithoutIntersection.intersection(nonOverlappingInterval);

  expect(intersectionResult).toBeNull();
});