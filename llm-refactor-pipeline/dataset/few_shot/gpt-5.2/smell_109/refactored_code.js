test("formats relative time for yesterday", () => {
  const unit = "days";
  const value = -1;

  expect(formatRelativeTime(unit, value, "auto")).toBe("yesterday");
  expect(formatRelativeTime(unit, value, "always")).toBe("1 day ago");
});