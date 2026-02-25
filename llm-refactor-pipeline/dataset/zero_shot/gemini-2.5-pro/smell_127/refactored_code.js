test("DateTime.fromFormat() parses format month names", () => {
  const testCases = [{
    s: "May 25 1982",
    f: "MMMM dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    s: "Sep 25 1982",
    f: "MMM dd yyyy",
    expected: {
      year: 1982,
      month: 9,
      day: 25
    }
  }, {
    s: "5 25 1982",
    f: "M dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    s: "05 25 1982",
    f: "MM dd yyyy",
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    s: "mai 25 1982",
    f: "MMMM dd yyyy",
    opts: {
      locale: "fr"
    },
    expected: {
      year: 1982,
      month: 5,
      day: 25
    }
  }, {
    s: "janv. 25 1982",
    f: "MMM dd yyyy",
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
    s,
    f,
    opts,
    expected
  }) => {
    const i = DateTime.fromFormat(s, f, opts);
    expect({
      year: i.year,
      month: i.month,
      day: i.day
    }).toEqual(expected);
  });
});