it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: 15, y: 0, w: 2, h: 2 } // Beyond 12 cols
  ];

  let compacted;
  expect(() => {
    compacted = fastVerticalCompactor.compact(layout, 12);
  }).not.toThrow();

  expect(compacted.length).toBe(1);
});