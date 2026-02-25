describe("formatRelativeTime for one day ago", () => {
  test("returns 'yesterday' when style is 'auto'", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  test("returns '1 day ago' when style is 'always'", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});