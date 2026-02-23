it("compares with static items (200 items, 20 static)", () => {
  const layout = generateRandomLayout(200, 12, 20);

  const stdTime = measureTime(
    () => verticalCompactor.compact(layout, 12),
    5
  );

  const fastTime = measureTime(
    () => fastVerticalCompactor.compact(layout, 12),
    5
  );

  expect(fastTime).toBeLessThan(stdTime);
});