test("DateTime#toLocaleString accepts options to the formatter", () => {
  const result = dt.toLocaleString({ weekday: "short" });
  expect(result).toContain("Tue");
});