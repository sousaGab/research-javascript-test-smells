it('returns correct last date for February in leap year', async () => {
  expect(formatYMD(lastDateOfMonth(parseYMD('2020-02-03')))).toEqual('2020-02-29')
})

it('returns correct last date for February in non-leap year', async () => {
  expect(formatYMD(lastDateOfMonth(parseYMD('2019-02-03')))).toEqual('2019-02-28')
})

it('returns correct last date for January', async () => {
  expect(formatYMD(lastDateOfMonth(parseYMD('2020-01-03')))).toEqual('2020-01-31')
})

it('returns correct last date for November', async () => {
  expect(formatYMD(lastDateOfMonth(parseYMD('2020-11-03')))).toEqual('2020-11-30')
})

it('returns correct last date for December', async () => {
  expect(formatYMD(lastDateOfMonth(parseYMD('2020-12-03')))).toEqual('2020-12-31')
})