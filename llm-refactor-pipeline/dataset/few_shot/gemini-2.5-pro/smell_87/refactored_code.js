it("handles pathological layouts that exceed max row limit gracefully", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

  const pathologicalLayout = [
    { i: "static", x: 0, y: 0, w: 12, h: 1, static: true },
    { i: "a", x: 0, y: 0, w: 13, h: 1 },
  ];

  const compactedLayout = fastHorizontalCompactor.compact(
    pathologicalLayout,
    12
  );

  expect(compactedLayout).toBeDefined();
  expect(compactedLayout.length).toBe(2);
  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});