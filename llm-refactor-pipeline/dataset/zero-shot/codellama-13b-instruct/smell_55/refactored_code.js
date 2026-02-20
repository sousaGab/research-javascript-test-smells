it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
  ];

  // Should not throw
  const compacted = fastVerticalCompactor.compact(layout, 12);
  expect(compacted.length).toBe(1);

  // Check that the compacted layout has the expected number of items
  expect(compacted.length).toBe(1);

  // Check that the compacted layout has the expected items
  expect(compacted[0].i).toBe("a");
  expect(compacted[0].x).toBe(15);
  expect(compacted[0].y).toBe(0);
  expect(compacted[0].w).toBe(2);
  expect(compacted[0].h).toBe(2);
});