test("yesterday with auto format", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
});

test("yesterday with always format", () => {
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});