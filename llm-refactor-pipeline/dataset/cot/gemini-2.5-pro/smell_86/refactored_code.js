describe("compact() with overlapping items", () => {
  const overlappingLayout = [
    { i: "a", x: 0, y: 0, w: 4, h: 4 },
    { i: "b", x: 2, y: 2, w: 4, h: 4 },
  ];

  it("should preserve item positions when overlap is allowed", () => {
    const allowOverlap = true;
    const compactedLayout = compact(
      overlappingLayout,
      "vertical",
      12,
      allowOverlap
    );

    const overlappingItem = compactedLayout.find(item => item.i === "b");
    expect(overlappingItem.y).toBe(2);
  });

  it("should resolve collisions by moving items when overlap is not allowed", () => {
    const allowOverlap = false;
    const compactedLayout = compact(
      overlappingLayout,
      "vertical",
      12,
      allowOverlap
    );

    const movedItem = compactedLayout.find(item => item.i === "b");
    expect(movedItem.y).toBe(4);
  });
});