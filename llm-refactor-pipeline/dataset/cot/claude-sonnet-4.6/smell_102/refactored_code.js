describe('oneYearAgo()', () => {
  it('returns the correct date one year ago for the last day of a leap year February', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
  })

  it('returns the correct date one year ago for February 28 in a leap year', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
  })

  it('returns the correct date one year ago for January 31', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
  })

  it('returns the correct date one year ago for November 1', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
  })

  it('returns the correct date one year ago for November 30', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
  })

  it('returns the correct date one year ago for December 31', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
  })
})