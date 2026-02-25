it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
  ];

  // Should not throw
  const compacted = fastVerticalCompactor.compact(layout, 12);
  expect(compacted.length).toBe(1);
  expect(compacted[0].x).toBe(12); // x position should be within grid
})