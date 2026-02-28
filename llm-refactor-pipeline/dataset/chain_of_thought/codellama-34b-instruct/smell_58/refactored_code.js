test("DateTime#toLocaleString accepts options to the formatter", () => {
  const dateTime = new DateTime(2023, 2, 21, 10, 30, 0);
  const options = { weekday: "short" };
  const expected = "Tue";
  const actual = dateTime.toLocaleString(options);
  expect(actual).toContain(expected);
})