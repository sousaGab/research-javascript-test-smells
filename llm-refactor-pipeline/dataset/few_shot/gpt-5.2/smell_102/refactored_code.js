it('oneYearAgo() returns the same calendar date one year earlier (clamped for leap day)', async () => {
  const cases = [
    { input: '2020-02-29', expected: '2019-02-28' }, // February 2020 was a leap year
    { input: '2020-02-28', expected: '2019-02-28' },
    { input: '2020-01-31', expected: '2019-01-31' },
    { input: '2020-11-01', expected: '2019-11-01' },
    { input: '2020-11-30', expected: '2019-11-30' },
    { input: '2020-12-31', expected: '2019-12-31' },
  ]

  for (const { input, expected } of cases) {
    expect(formatYMD(oneYearAgo(parseYMD(input)))).toEqual(expected)
  }
})