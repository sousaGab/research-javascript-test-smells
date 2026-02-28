test("yesterday - auto format", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
});

test("yesterday - always format", () => {
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});