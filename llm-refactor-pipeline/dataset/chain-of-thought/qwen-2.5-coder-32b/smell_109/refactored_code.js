test("formatRelativeTime returns correct relative time for yesterday", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});