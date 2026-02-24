it('lastDateOfMonth() works', async () => {
  const testCases = [
    { input: '2020-02-03', expected: '2020-02-29', description: 'February 2020 was a leap year' },
    { input: '2019-02-03', expected: '2019-02-28', description: 'February 2019 was not a leap year' },
    { input: '2020-01-03', expected: '2020-01-31', description: 'January has 31 days' },
    { input: '2020-11-03', expected: '2020-11-30', description: 'November has 30 days' },
    { input: '2020-12-03', expected: '2020-12-31', description: 'December has 31 days' }
  ]

  testCases.forEach(({ input, expected, description }) => {
    expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected)
  })
})