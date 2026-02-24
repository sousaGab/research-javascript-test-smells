it("handles items at x position beyond grid", () => {
  const layout = [
    { i: "a", x: 15, y: 0, w: 2, h: 2 }
  ];
  
  expect(() => fastVerticalCompactor.compact(layout, 12)).not.toThrow();
  
  const compacted = fastVerticalCompactor.compact(layout, 12);
  expect(compacted).toHaveLength(1);
});