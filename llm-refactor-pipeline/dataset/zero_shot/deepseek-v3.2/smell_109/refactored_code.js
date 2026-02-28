describe("formatRelativeTime for yesterday", () => {
  it("should return 'yesterday' when mode is 'auto'", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  it("should return '1 day ago' when mode is 'always'", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});