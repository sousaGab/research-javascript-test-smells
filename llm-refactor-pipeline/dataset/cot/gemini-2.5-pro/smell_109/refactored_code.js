test("should return 'yesterday' for -1 days when style is 'auto'", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
});

test("should return '1 day ago' for -1 days when style is 'always'", () => {
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
});