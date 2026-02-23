describe("compact() with overlapping items", () => {
  const overlappingLayout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 },
  ];
  const compactType = "vertical";
  const cols = 12;

  it("should preserve item positions when allowOverlap is true", () => {
    const allowOverlap = true;
    const compactedLayout = compact(
      overlappingLayout,
      compactType,
      cols,
      allowOverlap
    );
    const itemB = compactedLayout.find(l => l.i === "b");
    expect(itemB.y).toBe(2);
  });

  it("should resolve overlap by moving items when allowOverlap is false", () => {
    const allowOverlap = false;
    const compactedLayout = compact(
      overlappingLayout,
      compactType,
      cols,
      allowOverlap
    );
    const itemB = compactedLayout.find(l => l.i === "b");
    expect(itemB.y).toBe(4);
  });
});