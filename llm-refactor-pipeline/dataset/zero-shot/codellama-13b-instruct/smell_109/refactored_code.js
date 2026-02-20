describe("formatRelativeTime", () => {
  it("returns 'yesterday' for -1 days and 'auto' format", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  it("returns '1 day ago' for -1 days and 'always' format", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});