test("DateTime.fromRFC2822 parses a range of dates", () => {
  const testCases = [
    {
      input: "Sun, 12 Apr 2015 05:06:07 GMT",
      expected: [2015, 4, 12, 5, 6, 7],
    },
    {
      input: "Tue, 01 Nov 2016 01:23:45 +0000",
      expected: [2016, 11, 1, 1, 23, 45],
    },
    {
      input: "Tue, 01 Nov 16 04:23:45 Z",
      expected: [2016, 11, 1, 4, 23, 45],
    },
    {
      input: "01 Nov 2016 05:23:45 z",
      expected: [2016, 11, 1, 5, 23, 45],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 -0800",
      expected: [2017, 1, 2, 6 + 8, 0, 0],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 +0800",
      expected: [2017, 1, 1, 22, 0, 0],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 +0330",
      expected: [2017, 1, 2, 2, 30, 0],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 -0330",
      expected: [2017, 1, 2, 9, 30, 0],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 PST",
      expected: [2017, 1, 2, 6 + 8, 0, 0],
    },
    {
      input: "Mon, 02 Jan 2017 06:00:00 PDT",
      expected: [2017, 1, 2, 6 + 7, 0, 0],
    },
  ];

  for (const testCase of testCases) {
    const r = DateTime.fromRFC2822(testCase.input).toUTC();
    const actual = [r.year, r.month, r.day, r.hour, r.minute, r.second];
    expect(testCase.expected).toEqual(actual);
  }
})