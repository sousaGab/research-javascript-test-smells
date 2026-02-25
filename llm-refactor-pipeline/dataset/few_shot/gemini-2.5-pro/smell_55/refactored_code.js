it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
  ];

  // The compactor should not modify items that are out of bounds horizontally.
  const compacted = fastVerticalCompactor.compact(layout, 12);
  expect(compacted).toEqual(layout);
});