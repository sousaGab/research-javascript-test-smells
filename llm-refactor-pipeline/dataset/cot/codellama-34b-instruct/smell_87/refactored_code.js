it("handles pathological layouts that exceed max row limit gracefully", () => {
  const consoleWarn = jest.spyOn(console, "warn");

  // Create a pathological layout: static item blocking entire grid,
  // with an item that's wider than the grid (can't fit anywhere)
  const layout = [
    { i: "static", x: 0, y: 0, w: 12, h: 1, static: true },
    { i: "a", x: 0, y: 0, w: 13, h: 1 } // Wider than grid, can never fit
  ];

  // Should not throw and should handle gracefully
  const compacted = fastHorizontalCompactor.compact(layout, 12);

  // Layout should still be returned
  expect(compacted).toBeDefined();
  expect(compacted.length).toBe(2);

  // Warning should have been logged
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
})