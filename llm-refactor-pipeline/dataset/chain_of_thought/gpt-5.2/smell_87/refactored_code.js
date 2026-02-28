it("handles pathological layouts that exceed max row limit gracefully", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

  const gridWidth = 12;
  const layout = [
    { i: "static", x: 0, y: 0, w: gridWidth, h: 1, static: true },
    { i: "a", x: 0, y: 0, w: gridWidth + 1, h: 1 }
  ];

  const compacted = fastHorizontalCompactor.compact(layout, gridWidth);

  expect(compacted).toBeDefined();
  expect(compacted).toHaveLength(2);
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});