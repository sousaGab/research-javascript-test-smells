test("DateTime.fromFormat() parses format month names", () => {
  // Test full month names
  let i = DateTime.fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(i).toEqual({ year: 1982, month: 5, day: 25 });

  i = DateTime.fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(i).toEqual({ year: 1982, month: 9, day: 25 });

  // Test numeric months
  i = DateTime.fromFormat("5 25 1982", "M dd yyyy");
  expect(i).toEqual({ year: 1982, month: 5, day: 25 });

  i = DateTime.fromFormat("05 25 1982", "MM dd yyyy");
  expect(i).toEqual({ year: 1982, month: 5, day: 25 });

  // Test French locale
  i = DateTime.fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(i).toEqual({ year: 1982, month: 5, day: 25 });

  i = DateTime.fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(i).toEqual({ year: 1982, month: 1, day: 25 });
});