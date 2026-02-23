describe('oneYearAgo()', () => {
  const cases = [
    { input: '2020-02-29', expected: '2019-02-28', scenario: 'handles leap day by clamping to Feb 28' },
    { input: '2020-02-28', expected: '2019-02-28', scenario: 'keeps Feb 28 unchanged' },
    { input: '2020-01-31', expected: '2019-01-31', scenario: 'keeps Jan 31 unchanged' },
    { input: '2020-11-01', expected: '2019-11-01', scenario: 'keeps Nov 1 unchanged' },
    { input: '2020-11-30', expected: '2019-11-30', scenario: 'keeps Nov 30 unchanged' },
    { input: '2020-12-31', expected: '2019-12-31', scenario: 'keeps Dec 31 unchanged' },
  ]

  it.each(cases)('$scenario ($input -> $expected)', async ({ input, expected }) => {
    expect(formatYMD(oneYearAgo(parseYMD(input)))).toEqual(expected)
  })
})