test("formatRelativeTime with days and -1 in auto style returns yesterday", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
});

test("formatRelativeTime with days and -1 in always style returns 1 day ago", () => {
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});