describe("formatRelativeTime for one day ago", () => {
  test("should return 'yesterday' when format is 'auto'", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  test("should return '1 day ago' when format is 'always'", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});