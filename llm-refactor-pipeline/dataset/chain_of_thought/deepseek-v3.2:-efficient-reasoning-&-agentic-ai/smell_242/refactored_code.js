it("compares with static items (200 items, 20 static)", () => {
  const layout = generateRandomLayout(200, 12, 20);

  const stdResult = verticalCompactor.compact(layout, 12);
  const fastResult = fastVerticalCompactor.compact(layout, 12);

  expect(fastResult).toBeDefined();
  expect(fastResult.items).toHaveLength(200);
  expect(fastResult.staticItems).toHaveLength(20);
  expect(fastResult.height).toBe(12);
  
  const stdTime = measureTime(
    () => verticalCompactor.compact(layout, 12),
    5
  );

  const fastTime = measureTime(
    () => fastVerticalCompactor.compact(layout, 12),
    5
  );

  expect(fastTime).toBeLessThan(stdTime);
  expect(stdTime / fastTime).toBeGreaterThan(1);

  console.log(
    [
      "",
      "  With static items (200 items, 20 static):",
      `    Standard: ${stdTime.toFixed(2)}ms`,
      `    Fast:     ${fastTime.toFixed(2)}ms`,
      `    Speedup:  ${(stdTime / fastTime).toFixed(2)}x`
    ].join("\n")
  );
});