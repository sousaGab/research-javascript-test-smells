describe('lastDateOfMonth()', () => {
  const cases = [
    { input: '2020-02-03', expected: '2020-02-29', name: 'returns Feb 29 for leap year February 2020' },
    { input: '2019-02-03', expected: '2019-02-28', name: 'returns Feb 28 for non-leap year February 2019' },
    { input: '2020-01-03', expected: '2020-01-31', name: 'returns Jan 31 for January 2020' },
    { input: '2020-11-03', expected: '2020-11-30', name: 'returns Nov 30 for November 2020' },
    { input: '2020-12-03', expected: '2020-12-31', name: 'returns Dec 31 for December 2020' },
  ]

  it.each(cases)('$name', async ({ input, expected }) => {
    expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected)
  })
})