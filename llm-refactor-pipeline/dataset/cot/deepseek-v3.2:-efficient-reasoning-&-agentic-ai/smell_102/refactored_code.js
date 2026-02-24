it('oneYearAgo() handles leap year February 29th', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-02-29')))).toEqual('2019-02-28')
})

it('oneYearAgo() handles leap year February 28th', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-02-28')))).toEqual('2019-02-28')
})

it('oneYearAgo() handles January 31st', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-01-31')))).toEqual('2019-01-31')
})

it('oneYearAgo() handles November 1st', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-11-01')))).toEqual('2019-11-01')
})

it('oneYearAgo() handles November 30th', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-11-30')))).toEqual('2019-11-30')
})

it('oneYearAgo() handles December 31st', async () => {
  expect(formatYMD(oneYearAgo(parseYMD('2020-12-31')))).toEqual('2019-12-31')
})