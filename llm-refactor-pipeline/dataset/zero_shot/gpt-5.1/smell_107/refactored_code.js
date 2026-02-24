describe('lastDateOfMonth', () => {
  it('returns the correct last date for various months, including leap years', async () => {
    const testCases = [
      { input: '2020-02-03', expected: '2020-02-29' }, // February 2020 was a leap year
      { input: '2019-02-03', expected: '2019-02-28' },
      { input: '2020-01-03', expected: '2020-01-31' },
      { input: '2020-11-03', expected: '2020-11-30' },
      { input: '2020-12-03', expected: '2020-12-31' }
    ]

    testCases.forEach(({ input, expected }) => {
      expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected)
    })
  })
})