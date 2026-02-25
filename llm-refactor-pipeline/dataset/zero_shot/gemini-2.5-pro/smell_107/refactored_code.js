describe('lastDateOfMonth', () => {
  it('should return the 29th for February in a leap year', () => {
    const dateInLeapYearFebruary = parseYMD('2020-02-03');
    expect(formatYMD(lastDateOfMonth(dateInLeapYearFebruary))).toEqual('2020-02-29');
  });

  it('should return the 28th for February in a non-leap year', () => {
    const dateInNonLeapYearFebruary = parseYMD('2019-02-03');
    expect(formatYMD(lastDateOfMonth(dateInNonLeapYearFebruary))).toEqual('2019-02-28');
  });

  it('should return the 31st for a month with 31 days', () => {
    const dateInJanuary = parseYMD('2020-01-03');
    expect(formatYMD(lastDateOfMonth(dateInJanuary))).toEqual('2020-01-31');
  });

  it('should return the 30th for a month with 30 days', () => {
    const dateInNovember = parseYMD('2020-11-03');
    expect(formatYMD(lastDateOfMonth(dateInNovember))).toEqual('2020-11-30');
  });

  it('should return the 31st for December', () => {
    const dateInDecember = parseYMD('2020-12-03');
    expect(formatYMD(lastDateOfMonth(dateInDecember))).toEqual('2020-12-31');
  });
});