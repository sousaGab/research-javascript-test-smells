describe('lastDateOfMonth()', () => {
  const cases = [
    { input: '2020-02-03', expected: '2020-02-29', reason: 'leap year February' },
    { input: '2019-02-03', expected: '2019-02-28', reason: 'non-leap year February' },
    { input: '2020-01-03', expected: '2020-01-31', reason: '31-day month' },
    { input: '2020-11-03', expected: '2020-11-30', reason: '30-day month' },
    { input: '2020-12-03', expected: '2020-12-31', reason: 'end of year 31-day month' },
  ]

  it.each(cases)('returns $expected for $input ($reason)', ({ input, expected }) => {
    expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected)
  })
})