test("DateTime.fromFormat() parses format month names", () => {
  const testCases = [{
    input: "May 25 1982",
    format: "MMMM dd yyyy",
    expectedMonth: 5
  }, {
    input: "Sep 25 1982",
    format: "MMM dd yyyy",
    expectedMonth: 9
  }, {
    input: "5 25 1982",
    format: "M dd yyyy",
    expectedMonth: 5
  }, {
    input: "05 25 1982",
    format: "MM dd yyyy",
    expectedMonth: 5
  }, {
    input: "mai 25 1982",
    format: "MMMM dd yyyy",
    options: {
      locale: "fr"
    },
    expectedMonth: 5
  }, {
    input: "janv. 25 1982",
    format: "MMM dd yyyy",
    options: {
      locale: "fr"
    },
    expectedMonth: 1
  }, ];

  testCases.forEach(({
    input,
    format,
    options,
    expectedMonth
  }) => {
    const i = DateTime.fromFormat(input, format, options);
    expect(i).toMatchObject({
      year: 1982,
      month: expectedMonth,
      day: 25,
    });
  });
});