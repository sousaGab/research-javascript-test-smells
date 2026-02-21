test("DateTime#toLocaleString accepts options to the formatter", () => {
  const options = { weekday: "short" };
  const formattedDate = dt.toLocaleString(options);
  expect(formattedDate).toContain("Tue");
})