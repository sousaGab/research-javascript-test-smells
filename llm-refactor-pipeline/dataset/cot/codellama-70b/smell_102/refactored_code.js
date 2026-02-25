describe('oneYearAgo() works', () => {
  it('should return the date one year ago', () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
    expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
    expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
  })
})