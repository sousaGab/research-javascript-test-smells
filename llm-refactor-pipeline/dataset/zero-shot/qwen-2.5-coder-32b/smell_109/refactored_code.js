test("formats yesterday correctly", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});