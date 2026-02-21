describe("formatRelativeTime with days", () => {
  test("returns yesterday for -1 day with auto setting", () => {
    expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  });

  test("returns 1 day ago for -1 day with always setting", () => {
    expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
  });
});