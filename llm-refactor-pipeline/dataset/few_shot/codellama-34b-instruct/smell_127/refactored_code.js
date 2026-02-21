test("DateTime.fromFormat() parses format month names", () => {
  const inputs = [
    { input: "May 25 1982", format: "MMMM dd yyyy" },
    { input: "Sep 25 1982", format: "MMM dd yyyy" },
    { input: "5 25 1982", format: "M dd yyyy" },
    { input: "05 25 1982", format: "MM dd yyyy" },
    { input: "mai 25 1982", format: "MMMM dd yyyy", locale: "fr" },
    { input: "janv. 25 1982", format: "MMM dd yyyy", locale: "fr" },
  ];

  inputs.forEach((input) => {
    const i = DateTime.fromFormat(input.input, input.format, input.locale);
    expect(i.year).toBe(1982);
    expect(i.month).toBe(input.month);
    expect(i.day).toBe(25);
  });
});