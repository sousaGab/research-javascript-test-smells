test("DateTime.fromFormat() parses format month names", () => {
  const testCases = [
    { input: "May 25 1982", format: "MMMM dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "Sep 25 1982", format: "MMM dd yyyy", expected: { year: 1982, month: 9, day: 25 } },
    { input: "5 25 1982", format: "M dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "05 25 1982", format: "MM dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "mai 25 1982", format: "MMMM dd yyyy", options: { locale: "fr" }, expected: { year: 1982, month: 5, day: 25 } },
    { input: "janv. 25 1982", format: "MMM dd yyyy", options: { locale: "fr" }, expected: { year: 1982, month: 1, day: 25 } }
  ];

  testCases.forEach(({ input, format, options, expected }) => {
    const i = DateTime.fromFormat(input, format, options);
    expect(i.year).toBe(expected.year);
    expect(i.month).toBe(expected.month);
    expect(i.day).toBe(expected.day);
  });
});