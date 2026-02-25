it("handles pathological layouts that exceed max row limit gracefully", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

  const pathologicalLayout = [
    { i: "static", x: 0, y: 0, w: 12, h: 1, static: true },
    { i: "a", x: 0, y: 0, w: 13, h: 1 },
  ];
  const gridCols = 12;

  const compacted = fastHorizontalCompactor.compact(pathologicalLayout, gridCols);

  expect(compacted).toBeDefined();
  expect(compacted.length).toBe(2);
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});