it("compact() respects allowOverlap=true", () => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 }
  ];

  const getY = (compacted, id) => compacted.find(l => l.i === id).y;

  const compactedWithOverlap = compact(layout, "vertical", 12, true);
  expect(getY(compactedWithOverlap, "b")).toBe(2);

  const compactedWithoutOverlap = compact(layout, "vertical", 12, false);
  expect(getY(compactedWithoutOverlap, "b")).toBe(4);
});