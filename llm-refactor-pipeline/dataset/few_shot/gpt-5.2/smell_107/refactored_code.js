it('lastDateOfMonth() returns the last day for various months (including leap year February)', async () => {
  const cases = [
    { input: '2020-02-03', expected: '2020-02-29', reason: 'February 2020 (leap year)' },
    { input: '2019-02-03', expected: '2019-02-28', reason: 'February 2019 (non-leap year)' },
    { input: '2020-01-03', expected: '2020-01-31', reason: 'January 2020 (31 days)' },
    { input: '2020-11-03', expected: '2020-11-30', reason: 'November 2020 (30 days)' },
    { input: '2020-12-03', expected: '2020-12-31', reason: 'December 2020 (31 days)' },
  ]

  for (const { input, expected, reason } of cases) {
    expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected)
  }
})