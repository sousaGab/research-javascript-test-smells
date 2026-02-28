// Your COMPLETE refactored test code here
it("compact() respects allowOverlap=true", () => {
    // Directly test the compact function with overlapping items
    const layout = [
      { i: "a", x: 0, y: 0, w: 4, h: 4 },
      { i: "b", x: 2, y: 2, w: 4, h: 4 } // Overlaps with 'a'
    ];

    // With allowOverlap=true, positions should be preserved
    const compactedWithOverlap = compact(layout, "vertical", 12, true);
    expect(compactedWithOverlap.find(l => l.i === "b").y).toBe(2);

    // With allowOverlap=false (default), items should be separated
    // Note: Use "vertical" compactType to get collision resolution (#2213)
    // With compactType=null and allowOverlap=false, items stay in place (noCompactor)
    const compactedWithoutOverlap = compact(layout, "vertical", 12, false);
    // b should be pushed to y=4 (after a ends)
    expect(compactedWithoutOverlap.find(l => l.i === "b").y).toBe(4);
  })