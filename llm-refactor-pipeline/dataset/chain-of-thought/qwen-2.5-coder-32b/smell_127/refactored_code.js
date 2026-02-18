test("DateTime.fromFormat() parses format month names", () => {
  const testCases = [
    { input: "May 25 1982", format: "MMMM dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "Sep 25 1982", format: "MMM dd yyyy", expected: { year: 1982, month: 9, day: 25 } },
    { input: "5 25 1982", format: "M dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "05 25 1982", format: "MM dd yyyy", expected: { year: 1982, month: 5, day: 25 } },
    { input: "mai 25 1982", format: "MMMM dd yyyy", locale: "fr", expected: { year: 1982, month: 5, day: 25 } },
    { input: "janv. 25 1982", format: "MMM dd yyyy", locale: "fr", expected: { year: 1982, month: 1, day: 25 } }
  ];

  for (const { input, format, locale, expected } of testCases) {
    const result = DateTime.fromFormat(input, format, { locale });
    expect(result.year).toBe(expected.year);
    expect(result.month).toBe(expected.month);
    expect(result.day).toBe(expected.day);
  }
});