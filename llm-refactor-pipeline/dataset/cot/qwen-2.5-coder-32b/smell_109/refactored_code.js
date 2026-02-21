describe("formatRelativeTime", () => {
  test("returns 'yesterday' for days ago with auto setting", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  test("returns '1 day ago' for days ago with always setting", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});