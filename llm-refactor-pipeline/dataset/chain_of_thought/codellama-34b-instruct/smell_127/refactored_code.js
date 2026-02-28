// Your COMPLETE refactored test code here

test("DateTime.fromFormat() parses format month names", () => {
  const dateStrings = [
    "May 25 1982",
    "Sep 25 1982",
    "5 25 1982",
    "05 25 1982",
    "mai 25 1982",
    "janv. 25 1982"
  ];

  const formats = [
    "MMMM dd yyyy",
    "MMM dd yyyy",
    "M dd yyyy",
    "MM dd yyyy",
    "MMMM dd yyyy",
    "MMM dd yyyy"
  ];

  const locales = [
    undefined,
    undefined,
    undefined,
    undefined,
    "fr",
    "fr"
  ];

  dateStrings.forEach((dateString, index) => {
    const i = DateTime.fromFormat(dateString, formats[index], { locale: locales[index] });
    expect(i.year).toBe(1982);
    expect(i.month).toBe(index + 1);
    expect(i.day).toBe(25);
  });
});