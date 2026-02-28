describe('lastDateOfMonth()', () => {
  const testCases = [
    {
      description: 'returns Feb 29 for a leap year (February 2020)',
      input: '2020-02-03',
      expected: '2020-02-29',
    },
    {
      description: 'returns Feb 28 for a non-leap year (February 2019)',
      input: '2019-02-03',
      expected: '2019-02-28',
    },
    {
      description: 'returns Jan 31 for January 2020',
      input: '2020-01-03',
      expected: '2020-01-31',
    },
    {
      description: 'returns Nov 30 for November 2020',
      input: '2020-11-03',
      expected: '2020-11-30',
    },
    {
      description: 'returns Dec 31 for December 2020',
      input: '2020-12-03',
      expected: '2020-12-31',
    },
  ];

  testCases.forEach(({ description, input, expected }) => {
    it(description, async () => {
      const result = formatYMD(lastDateOfMonth(parseYMD(input)));
      expect(result).toEqual(expected);
    });
  });
})