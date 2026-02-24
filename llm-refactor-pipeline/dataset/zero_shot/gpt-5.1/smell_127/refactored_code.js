test("DateTime.fromFormat() parses format month names", () => {
  const cases = [
    { input: "May 25 1982", format: "MMMM dd yyyy", options: undefined, year: 1982, month: 5, day: 25 },
    { input: "Sep 25 1982", format: "MMM dd yyyy", options: undefined, year: 1982, month: 9, day: 25 },
    { input: "5 25 1982", format: "M dd yyyy", options: undefined, year: 1982, month: 5, day: 25 },
    { input: "05 25 1982", format: "MM dd yyyy", options: undefined, year: 1982, month: 5, day: 25 },
    { input: "mai 25 1982", format: "MMMM dd yyyy", options: { locale: "fr" }, year: 1982, month: 5, day: 25 },
    { input: "janv. 25 1982", format: "MMM dd yyyy", options: { locale: "fr" }, year: 1982, month: 1, day: 25 },
  ];

  cases.forEach(({ input, format, options, year, month, day }) => {
    const i = DateTime.fromFormat(input, format, options);
    expect(i.year).toBe(year);
    expect(i.month).toBe(month);
    expect(i.day).toBe(day);
  });
});