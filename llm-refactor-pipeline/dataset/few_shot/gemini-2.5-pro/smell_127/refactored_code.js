describe("DateTime.fromFormat() parses format month names", () => {
  const cases = [
    { s: "May 25 1982", fmt: "MMMM dd yyyy", month: 5 },
    { s: "Sep 25 1982", fmt: "MMM dd yyyy", month: 9 },
    { s: "5 25 1982", fmt: "M dd yyyy", month: 5 },
    { s: "05 25 1982", fmt: "MM dd yyyy", month: 5 },
    { s: "mai 25 1982", fmt: "MMMM dd yyyy", month: 5, opts: { locale: "fr" } },
    { s: "janv. 25 1982", fmt: "MMM dd yyyy", month: 1, opts: { locale: "fr" } },
  ];

  test.each(cases)("parses '$s' with format '$fmt'", ({ s, fmt, month, opts }) => {
    const i = DateTime.fromFormat(s, fmt, opts);
    expect(i.year).toBe(1982);
    expect(i.month).toBe(month);
    expect(i.day).toBe(25);
  });
});