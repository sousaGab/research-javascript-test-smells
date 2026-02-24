it('oneYearAgo() returns correct date one year earlier for various edge cases', async () => {
  const testCases = [
    { input: '2020-02-29', expected: '2019-02-28' }, // leap day
    { input: '2020-02-28', expected: '2019-02-28' },
    { input: '2020-01-31', expected: '2019-01-31' },
    { input: '2020-11-01', expected: '2019-11-01' },
    { input: '2020-11-30', expected: '2019-11-30' },
    { input: '2020-12-31', expected: '2019-12-31' },
  ]

  testCases.forEach(({ input, expected }) => {
    const result = formatYMD(oneYearAgo(parseYMD(input)))
    expect(result).toEqual(expected)
  })
})