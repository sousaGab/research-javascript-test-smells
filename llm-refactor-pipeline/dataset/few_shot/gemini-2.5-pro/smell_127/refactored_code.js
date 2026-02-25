test("DateTime.fromFormat() parses format month names", () => {
  const testCases = [{
    date: "May 25 1982",
    format: "MMMM dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    date: "Sep 25 1982",
    format: "MMM dd yyyy",
    expected: {
      year: 1982,
      month: 9,
      day: 25
    }
  }, {
    date: "5 25 1982",
    format: "M dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    date: "05 25 1982",
    format: "MM dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    date: "mai 25 1982",
    format: "MMMM dd yyyy",
    opts: {
      locale: "fr"
    },
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    date: "janv. 25 1982",
    format: "MMM dd yyyy",
    opts: {
      locale: "fr"
    },
    expected: {
      year: 1982,
      month: 1,
      day: 25
    }
  }, ];

  testCases.forEach(({
    date,
    format,
    opts,
    expected
  }) => {
    const i = DateTime.fromFormat(date, format, opts);
    const {
      year,
      month,
      day
    } = i;
    expect({
      year,
      month,
      day
    }).toEqual(expected);
  });
});