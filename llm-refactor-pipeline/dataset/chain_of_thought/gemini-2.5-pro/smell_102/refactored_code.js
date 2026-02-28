describe('oneYearAgo', () => {
  it('should return Feb 28 of the prior year when the date is a leap day', async () => {
    // February 2020 was a leap year, so one year ago from Feb 29 is Feb 28
    const leapDay = parseYMD('2020-02-29');
    const expectedDate = '2019-02-28';
    expect(formatYMD(oneYearAgo(leapDay))).toEqual(expectedDate);
  });

  it('should return the same calendar date in the prior year for non-leap days', async () => {
    const testCases = [
      { input: '2020-02-28', expected: '2019-02-28' },
      { input: '2020-01-31', expected: '2019-01-31' },
      { input: '2020-11-01', expected: '2019-11-01' },
      { input: '2020-11-30', expected: '2019-11-30' },
      { input: '2020-12-31', expected: '2019-12-31' },
    ];

    for (const { input, expected } of testCases) {
      const date = parseYMD(input);
      expect(formatYMD(oneYearAgo(date))).toEqual(expected);
    }
  });
});