describe("compact() with overlapping items", () => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 },
  ];

  it("should preserve their positions when allowOverlap is true", () => {
    const compactedLayout = compact(layout, "vertical", 12, true);
    const itemB = compactedLayout.find(l => l.i === "b");
    expect(itemB.y).toBe(2);
  });

  it("should move an item to resolve the collision when allowOverlap is false", () => {
    const compactedLayout = compact(layout, "vertical", 12, false);
    const itemB = compactedLayout.find(l => l.i === "b");
    expect(itemB.y).toBe(4);
  });
});