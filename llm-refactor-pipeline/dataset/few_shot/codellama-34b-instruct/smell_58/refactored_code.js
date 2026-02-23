test("DateTime#toLocaleString accepts options to the formatter", () => {
  const dt = new DateTime();
  const formatted = dt.toLocaleString({ weekday: "short" });
  expect(formatted).toContain("Tue");
})