test("DateTime.fromFormat() parses format month names", () => {
  const cases = [
    { text: "May 25 1982", fmt: "MMMM dd yyyy", opts: undefined, expected: { year: 1982, month: 5, day: 25 } },
    { text: "Sep 25 1982", fmt: "MMM dd yyyy", opts: undefined, expected: { year: 1982, month: 9, day: 25 } },
    { text: "5 25 1982", fmt: "M dd yyyy", opts: undefined, expected: { year: 1982, month: 5, day: 25 } },
    { text: "05 25 1982", fmt: "MM dd yyyy", opts: undefined, expected: { year: 1982, month: 5, day: 25 } },
    { text: "mai 25 1982", fmt: "MMMM dd yyyy", opts: { locale: "fr" }, expected: { year: 1982, month: 5, day: 25 } },
    { text: "janv. 25 1982", fmt: "MMM dd yyyy", opts: { locale: "fr" }, expected: { year: 1982, month: 1, day: 25 } },
  ];

  for (const { text, fmt, opts, expected } of cases) {
    const i = opts ? DateTime.fromFormat(text, fmt, opts) : DateTime.fromFormat(text, fmt);
    expect(i.year).toBe(expected.year);
    expect(i.month).toBe(expected.month);
    expect(i.day).toBe(expected.day);
  }
});