test("yesterday", () => {
  const yesterday = -1;
  const always = "always";
  const auto = "auto";

  expect(formatRelativeTime("days", yesterday, always)).toBe("1 day ago");
  expect(formatRelativeTime("days", yesterday, auto)).toBe("yesterday");
})