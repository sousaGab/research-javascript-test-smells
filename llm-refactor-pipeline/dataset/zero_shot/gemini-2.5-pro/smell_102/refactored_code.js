describe('oneYearAgo', () => {
  it('should return Feb 28th of the previous year when the input is Feb 29th of a leap year', () => {
    // February 2020 was a leap year
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
  })

  it('should return the same date in the previous year for non-leap day dates', () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
    expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
    expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
  })
})