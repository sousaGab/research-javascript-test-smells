describe('lastDateOfMonth', () => {
  it('should return the last day of the month for a leap year February', () => {
    // February 2020 was a leap year
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-02-03')))).toEqual('2020-02-29');
  });

  it('should return the last day of the month for a non-leap year February', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2019-02-03')))).toEqual('2019-02-28');
  });

  it('should return the last day of a 31-day month', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-01-03')))).toEqual('2020-01-31');
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-12-03')))).toEqual('2020-12-31');
  });

  it('should return the last day of a 30-day month', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-11-03')))).toEqual('2020-11-30');
  });
});