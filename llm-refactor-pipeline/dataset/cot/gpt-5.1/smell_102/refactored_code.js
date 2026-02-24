describe('oneYearAgo()', () => {
  const testCases = [
    {
      description: 'returns Feb 28, 2019 for leap day Feb 29, 2020',
      input: '2020-02-29',
      expected: '2019-02-28',
    },
    {
      description: 'returns Feb 28, 2019 for Feb 28, 2020',
      input: '2020-02-28',
      expected: '2019-02-28',
    },
    {
      description: 'returns Jan 31, 2019 for Jan 31, 2020',
      input: '2020-01-31',
      expected: '2019-01-31',
    },
    {
      description: 'returns Nov 1, 2019 for Nov 1, 2020',
      input: '2020-11-01',
      expected: '2019-11-01',
    },
    {
      description: 'returns Nov 30, 2019 for Nov 30, 2020',
      input: '2020-11-30',
      expected: '2019-11-30',
    },
    {
      description: 'returns Dec 31, 2019 for Dec 31, 2020',
      input: '2020-12-31',
      expected: '2019-12-31',
    },
  ]

  testCases.forEach(({ description, input, expected }) => {
    it(description, () => {
      const actual = formatYMD(oneYearAgo(parseYMD(input)))
      expect(actual).toEqual(expected)
    })
  })
})