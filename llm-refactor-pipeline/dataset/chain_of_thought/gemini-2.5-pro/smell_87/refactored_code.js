it("should handle an unfittable item by logging a max row limit warning", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();
  const gridWidth = 12;

  const layoutWithUnfittableItem = [
    { i: "static-blocker", x: 0, y: 0, w: gridWidth, h: 1, static: true },
    { i: "too-wide-item", x: 0, y: 0, w: gridWidth + 1, h: 1 },
  ];

  const compactedLayout = fastHorizontalCompactor.compact(
    layoutWithUnfittableItem,
    gridWidth
  );

  expect(compactedLayout).toBeDefined();
  expect(compactedLayout.length).toBe(2);
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});