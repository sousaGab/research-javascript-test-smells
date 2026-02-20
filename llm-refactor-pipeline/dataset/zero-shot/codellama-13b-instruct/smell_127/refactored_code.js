test("DateTime.fromFormat() parses format month names", () => {
  const i = DateTime.fromFormat("May 25 1982", "MMMM dd yyyy");
  expect(i.year).toBe(1982);
  expect(i.month).toBe(5);
  expect(i.day).toBe(25);

  const i2 = DateTime.fromFormat("Sep 25 1982", "MMM dd yyyy");
  expect(i2.year).toBe(1982);
  expect(i2.month).toBe(9);
  expect(i2.day).toBe(25);

  const i3 = DateTime.fromFormat("5 25 1982", "M dd yyyy");
  expect(i3.year).toBe(1982);
  expect(i3.month).toBe(5);
  expect(i3.day).toBe(25);

  const i4 = DateTime.fromFormat("05 25 1982", "MM dd yyyy");
  expect(i4.year).toBe(1982);
  expect(i4.month).toBe(5);
  expect(i4.day).toBe(25);

  const i5 = DateTime.fromFormat("mai 25 1982", "MMMM dd yyyy", { locale: "fr" });
  expect(i5.year).toBe(1982);
  expect(i5.month).toBe(5);
  expect(i5.day).toBe(25);

  const i6 = DateTime.fromFormat("janv. 25 1982", "MMM dd yyyy", { locale: "fr" });
  expect(i6.year).toBe(1982);
  expect(i6.month).toBe(1);
  expect(i6.day).toBe(25);
});