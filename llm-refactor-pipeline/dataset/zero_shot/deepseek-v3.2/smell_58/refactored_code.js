test("DateTime#toLocaleString accepts options to the formatter", () => {
  expect(dt.toLocaleString({ weekday: "short" })).toContain("Tue");
})