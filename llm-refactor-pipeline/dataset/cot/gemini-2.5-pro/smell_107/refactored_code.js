describe('lastDateOfMonth', () => {
  it('should return the 29th for February in a leap year', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-02-03')))).toEqual('2020-02-29');
  });

  it('should return the 28th for February in a non-leap year', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2019-02-03')))).toEqual('2019-02-28');
  });

  it('should return the 31st for a 31-day month', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-01-03')))).toEqual('2020-01-31');
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-12-03')))).toEqual('2020-12-31');
  });

  it('should return the 30th for a 30-day month', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-11-03')))).toEqual('2020-11-30');
  });
});