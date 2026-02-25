describe('oneYearAgo', () => {
  it.each([
    { given: '2020-02-29', expected: '2019-02-28', description: 'a leap day' },
    { given: '2020-02-28', expected: '2019-02-28', description: 'the day before a leap day' },
    { given: '2020-01-31', expected: '2019-01-31', description: 'a standard end-of-month' },
    { given: '2020-11-01', expected: '2019-11-01', description: 'a standard start-of-month' },
    { given: '2020-11-30', expected: '2019-11-30', description: 'a standard end-of-month' },
    { given: '2020-12-31', expected: '2019-12-31', description: 'the end of the year' },
  ])('should return $expected when given $given ($description)', ({ given, expected }) => {
    expect(formatYMD(oneYearAgo(parseYMD(given)))).toEqual(expected);
  });
});