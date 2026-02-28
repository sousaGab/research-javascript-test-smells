// Your COMPLETE refactored test code here
it("compares with static items (200 items, 20 static)", () => {
  const layout = generateRandomLayout(200, 12, 20);

  const stdResult = verticalCompactor.compact(layout, 12);
  const fastResult = fastVerticalCompactor.compact(layout, 12);

  expect(stdResult).toBeDefined();
  expect(fastResult).toBeDefined();

  // Validate intended behavior: both implementations should produce the same compacted layout.
  expect(fastResult).toEqual(stdResult);

  // Optional performance measurement (kept), but no longer the only "verification".
  const stdTime = measureTime(() => verticalCompactor.compact(layout, 12), 5);
  const fastTime = measureTime(() => fastVerticalCompactor.compact(layout, 12), 5);

  expect(Number.isFinite(stdTime)).toBe(true);
  expect(Number.isFinite(fastTime)).toBe(true);
  expect(stdTime).toBeGreaterThanOrEqual(0);
  expect(fastTime).toBeGreaterThanOrEqual(0);

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