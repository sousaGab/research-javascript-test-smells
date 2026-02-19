test("DateTime.fromFormat() parses format month names", () => {
  // Test full month name
  let i = DateTime.fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  // Test abbreviated month name
  i = DateTime.fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(9);
  expect(i.day).toBe(25);

  // Test numeric month (single digit)
  i = DateTime.fromFormat("5 25 1982", "M dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  // Test numeric month (zero-padded)
  i = DateTime.fromFormat("05 25 1982", "MM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  // Test French full month name
  i = DateTime.fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  // Test French abbreviated month name
  i = DateTime.fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(i.year).toBe(1982);
  expect(i.month).toBe(1);
  expect(i.day).toBe(25);
});