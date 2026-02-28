describe('lastDateOfMonth', () => {
  it('should return correct last date for February in leap year', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-02-03')))).toEqual('2020-02-29');
  });

  it('should return correct last date for February in non-leap year', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2019-02-03')))).toEqual('2019-02-28');
  });

  it('should return correct last date for January', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-01-03')))).toEqual('2020-01-31');
  });

  it('should return correct last date for November', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-11-03')))).toEqual('2020-11-30');
  });

  it('should return correct last date for December', () => {
    expect(formatYMD(lastDateOfMonth(parseYMD('2020-12-03')))).toEqual('2020-12-31');
  });
});