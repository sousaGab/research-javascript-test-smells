it("compact() respects allowOverlap flag", () => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 }
  ];

  const compactedWithOverlap = compact(layout, "vertical", 12, true);
  expect(compactedWithOverlap.find(l => l.i === "b").y).toBe(2);

  const compactedWithoutOverlap = compact(layout, "vertical", 12, false);
  expect(compactedWithoutOverlap.find(l => l.i === "b").y).toBe(4);
});