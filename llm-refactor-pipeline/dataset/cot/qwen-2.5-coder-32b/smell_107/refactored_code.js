describe('lastDateOfMonth()', () => {
  it('returns the last date of February in leap year', () => {
    const result = lastDateOfMonth(parseYMD('2020-02-03'))
    expect(formatYMD(result)).toEqual('2020-02-29')
  })

  it('returns the last date of February in non-leap year', () => {
    const result = lastDateOfMonth(parseYMD('2019-02-03'))
    expect(formatYMD(result)).toEqual('2019-02-28')
  })

  it('returns the last date of January', () => {
    const result = lastDateOfMonth(parseYMD('2020-01-03'))
    expect(formatYMD(result)).toEqual('2020-01-31')
  })

  it('returns the last date of November', () => {
    const result = lastDateOfMonth(parseYMD('2020-11-03'))
    expect(formatYMD(result)).toEqual('2020-11-30')
  })

  it('returns the last date of December', () => {
    const result = lastDateOfMonth(parseYMD('2020-12-03'))
    expect(formatYMD(result)).toEqual('2020-12-31')
  })
})