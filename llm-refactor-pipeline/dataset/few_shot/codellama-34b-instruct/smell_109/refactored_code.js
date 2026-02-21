test("yesterday", () => {
  const daysAgo = -1;
  const autoResult = formatRelativeTime("days", daysAgo, "auto");
  const alwaysResult = formatRelativeTime("days", daysAgo, "always");

  expect(autoResult).toBe("yesterday");
  expect(alwaysResult).toBe("1 day ago");
})