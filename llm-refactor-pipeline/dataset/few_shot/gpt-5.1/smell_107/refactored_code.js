describe('lastDateOfMonth()', () => {
  const testCases = [
    {
      description: 'returns 29 for February in a leap year (2020-02-03 → 2020-02-29)',
      input: '2020-02-03',
      expected: '2020-02-29',
    },
    {
      description: 'returns 28 for February in a non-leap year (2019-02-03 → 2019-02-28)',
      input: '2019-02-03',
      expected: '2019-02-28',
    },
    {
      description: 'returns 31 for January (2020-01-03 → 2020-01-31)',
      input: '2020-01-03',
      expected: '2020-01-31',
    },
    {
      description: 'returns 30 for November (2020-11-03 → 2020-11-30)',
      input: '2020-11-03',
      expected: '2020-11-30',
    },
    {
      description: 'returns 31 for December (2020-12-03 → 2020-12-31)',
      input: '2020-12-03',
      expected: '2020-12-31',
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, async () => {
      expect(formatYMD(lastDateOfMonth(parseYMD(input)))).toEqual(expected);
    });
  });
})