describe("when the relative time is one day ago", () => {
  it("should return 'yesterday' when format is 'auto'", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  it("should return '1 day ago' when format is 'always'", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});