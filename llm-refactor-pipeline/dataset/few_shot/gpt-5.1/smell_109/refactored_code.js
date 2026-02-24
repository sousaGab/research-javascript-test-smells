test("formats relative time for yesterday correctly", () => {
  const unit = "days";
  const value = -1;

  const resultAuto = formatRelativeTime(unit, value, "auto");
  const resultAlways = formatRelativeTime(unit, value, "always");

  expect(resultAuto).toBe("yesterday");
  expect(resultAlways).toBe("1 day ago");
});