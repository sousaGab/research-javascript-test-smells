test("DateTime#toLocaleString accepts options to the formatter", () => {
  const options = { weekday: "short" };
  const result = dt.toLocaleString(options);
  expect(result).toContain("Tue");
});