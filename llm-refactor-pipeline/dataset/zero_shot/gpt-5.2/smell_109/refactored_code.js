describe("formatRelativeTime", () => {
  test("formats -1 day as 'yesterday' in auto style and '1 day ago' in always style", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});