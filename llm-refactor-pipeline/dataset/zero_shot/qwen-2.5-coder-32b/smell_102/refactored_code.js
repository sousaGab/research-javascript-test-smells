it('oneYearAgo() works with leap year date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
  })

  it('oneYearAgo() works with non-leap year date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
  })

  it('oneYearAgo() works with month end date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
  })

  it('oneYearAgo() works with November date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
  })

  it('oneYearAgo() works with November end date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
  })

  it('oneYearAgo() works with December end date', async () => {
    expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
  })