describe('oneYearAgo()', () => {
  it('returns one year ago for Feb 29 in a leap year', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
  })

  it('returns one year ago for Feb 28 in a leap year', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
  })

  it('returns one year ago for Jan 31', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
  })

  it('returns one year ago for Nov 1', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
  })

  it('returns one year ago for Nov 30', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
  })

  it('returns one year ago for Dec 31', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
  })
})