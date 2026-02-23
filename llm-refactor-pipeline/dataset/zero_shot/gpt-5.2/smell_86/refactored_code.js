it("compact() respects allowOverlap=true", () => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 }
  ];

  const getY = (items, id) => items.find(l => l.i === id).y;

  expect(getY(compact(layout, "vertical", 12, true), "b")).toBe(2);
  expect(getY(compact(layout, "vertical", 12, false), "b")).toBe(4);
});