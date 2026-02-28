describe('oneYearAgo()', () => {
  const cases = [
    { input: '2020-02-29', expected: '2019-02-28', reason: 'leap day clamps to Feb 28 in non-leap year' },
    { input: '2020-02-28', expected: '2019-02-28', reason: 'non-leap day in February remains same day' },
    { input: '2020-01-31', expected: '2019-01-31', reason: 'end of month remains same day when valid' },
    { input: '2020-11-01', expected: '2019-11-01', reason: 'regular date remains same month/day' },
    { input: '2020-11-30', expected: '2019-11-30', reason: 'end of month remains same day when valid' },
    { input: '2020-12-31', expected: '2019-12-31', reason: 'end of year remains same month/day' },
  ]

  it.each(cases)('returns $expected for $input ($reason)', async ({ input, expected }) => {
    expect(formatYMD(oneYearAgo(parseYMD(input)))).toEqual(expected)
  })
})