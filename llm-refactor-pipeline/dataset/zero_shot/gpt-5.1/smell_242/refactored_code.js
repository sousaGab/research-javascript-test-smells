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

  console.log(
    [
      "",
      "  With static items (200 items, 20 static):",
      `    Standard: ${stdTime.toFixed(2)}ms`,
      `    Fast:     ${fastTime.toFixed(2)}ms`,
      `    Speedup:  ${(stdTime / fastTime).toFixed(2)}x`
    ].join("\n")
  );

  // Ensure both compactors produce valid, consistent layouts
  const stdLayout = verticalCompactor.compact(layout, 12);
  const fastLayout = fastVerticalCompactor.compact(layout, 12);

  expect(stdLayout).toBeDefined();
  expect(fastLayout).toBeDefined();
  expect(Array.isArray(stdLayout)).toBe(true);
  expect(Array.isArray(fastLayout)).toBe(true);
  expect(stdLayout.length).toBe(layout.length);
  expect(fastLayout.length).toBe(layout.length);

  // Ensure both implementations produce the same result
  expect(fastLayout).toEqual(stdLayout);

  // Optional performance expectation: fast implementation should not be slower
  expect(fastTime).toBeLessThanOrEqual(stdTime * 1.1);
});