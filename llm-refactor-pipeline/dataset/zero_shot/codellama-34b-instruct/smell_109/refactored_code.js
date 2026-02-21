test("formatRelativeTime returns 'yesterday' for -1 days in 'auto' mode", () => {
  expect(formatRelativeTime("days", -1, "auto")).toBe("yesterday");
})

test("formatRelativeTime returns '1 day ago' for -1 days in 'always' mode", () => {
  expect(formatRelativeTime("days", -1, "always")).toBe("1 day ago");
})