describe("formatRelativeTime for yesterday", () => {
  const unit = "days";
  const value = -1;

  test("returns 'yesterday' when style is auto", () => {
    const style = "auto";
    const result = formatRelativeTime(unit, value, style);
    expect(result).toBe("yesterday");
  });

  test("returns '1 day ago' when style is always", () => {
    const style = "always";
    const result = formatRelativeTime(unit, value, style);
    expect(result).toBe("1 day ago");
  });
})