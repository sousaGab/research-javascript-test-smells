describe("formatRelativeTime - days -1", () => {
  test("returns 'yesterday' when numeric is 'auto'", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  test("returns '1 day ago' when numeric is 'always'", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});