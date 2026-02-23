it("handles pathological layouts that exceed max row limit gracefully", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

  const layout = [
    { i: "static", x: 0, y: 0, w: 12, h: 1, static: true }, // Static item blocking the entire grid
    { i: "a", x: 0, y: 0, w: 13, h: 1 }, // Item wider than the grid, can never fit
  ];

  const compacted = fastHorizontalCompactor.compact(layout, 12);

  expect(compacted).toBeDefined();
  expect(compacted.length).toBe(2);

  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});