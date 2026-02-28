const gridSize = 12;

it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: gridSize + 1, y: 0, w: 2, h: 2 } // Beyond 12 cols
  ];

  // Should not throw
  const compacted = fastVerticalCompactor.compact(layout, gridSize);
  expect(compacted.length).toBe(1);
})