it("handles layouts exceeding max row limit without throwing and logs a warning", () => {
  const consoleWarn = jest.spyOn(console, "warn").mockImplementation();

  const layout = [
    { i: "static", x: 0, y: 0, w: 12, h: 1, static: true },
    { i: "a", x: 0, y: 0, w: 13, h: 1 }
  ];

  const compacted = fastHorizontalCompactor.compact(layout, 12);

  expect(compacted).toBeDefined();
  expect(compacted.length).toBe(2);

  expect(consoleWarn).toHaveBeenCalledWith(
    expect.stringContaining("exceeded max row limit")
  );

  consoleWarn.mockRestore();
});