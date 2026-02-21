function testDateTimeFromFormat(format, dateString, expectedYear, expectedMonth, expectedDay) {
  const i = DateTime.fromFormat(dateString, format);
  expect(i.year).toBe(expectedYear);
  expect(i.month).toBe(expectedMonth);
  expect(i.day).toBe(expectedDay);
}

test("DateTime.fromFormat() parses format month names", () => {
  testDateTimeFromFormat("MMMM dd yyyy", "May 25 1982", 1982, 5, 25);
  testDateTimeFromFormat("MMM dd yyyy", "Sep 25 1982", 1982, 9, 25);
  testDateTimeFromFormat("M dd yyyy", "5 25 1982", 1982, 5, 25);
  testDateTimeFromFormat("MM dd yyyy", "05 25 1982", 1982, 5, 25);
  testDateTimeFromFormat("MMMM dd yyyy", "mai 25 1982", 1982, 5, 25, { locale: "fr" });
  testDateTimeFromFormat("MMM dd yyyy", "janv. 25 1982", 1982, 1, 25, { locale: "fr" });
})