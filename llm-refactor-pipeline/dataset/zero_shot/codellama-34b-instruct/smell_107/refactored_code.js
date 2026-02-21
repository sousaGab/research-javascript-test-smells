it('lastDateOfMonth() returns the last day of the month', async () => {
    // February 2020 was a leap year
    expect(lastDateOfMonth(parseYMD('2020-02-03'))).toEqual(new Date(2020, 1, 29));
    expect(lastDateOfMonth(parseYMD('2019-02-03'))).toEqual(new Date(2019, 1, 28));
    expect(lastDateOfMonth(parseYMD('2020-01-03'))).toEqual(new Date(2020, 0, 31));
    expect(lastDateOfMonth(parseYMD('2020-11-03'))).toEqual(new Date(2020, 10, 30));
    expect(lastDateOfMonth(parseYMD('2020-12-03'))).toEqual(new Date(2020, 11, 31));
  })