it("compact() respects allowOverlap=true", () => {
    // Arrange
    const layout = [
      { i: "a", x: 0, y: 0, w: 4, h: 4 },
      { i: "b", x: 2, y: 2, w: 4, h: 4 } // Overlaps with 'a'
    ];
    const compactType = "vertical";
    const cols = 12;

    // Act
    const compactedWithOverlap = compact(layout, compactType, cols, true);
    const compactedWithoutOverlap = compact(layout, compactType, cols, false);

    // Assert
    expect(compactedWithOverlap.find(l => l.i === "b").y).toBe(2);
    expect(compactedWithoutOverlap.find(l => l.i === "b").y).toBe(4);
  })