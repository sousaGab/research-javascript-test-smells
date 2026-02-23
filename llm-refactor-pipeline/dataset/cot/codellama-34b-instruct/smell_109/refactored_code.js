// Your COMPLETE refactored test code here
test("yesterday", () => {
  const yesterday = formatRelativeTime("days", -1, "auto");
  expect(yesterday).toBe("yesterday");
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
})