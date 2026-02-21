test("DateTime#toLocaleString accepts options to the formatter", () => {
  const formattedDate = dt.toLocaleString({ weekday: "short" });
  expect(formattedDate).toContain("Tue");
})