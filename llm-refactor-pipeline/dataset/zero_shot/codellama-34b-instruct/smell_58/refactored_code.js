test("DateTime#toLocaleString accepts options to the formatter", () => {
  const options = { weekday: "short" };
  const formattedString = dt.toLocaleString(options);
  expect(formattedString).toContain("Tue");
})