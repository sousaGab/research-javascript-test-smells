it('lastDateOfMonth() works', async () => {
  const february2020 = parseYMD('2020-02-03');
  const february2019 = parseYMD('2019-02-03');
  const january2020 = parseYMD('2020-01-03');
  const november2020 = parseYMD('2020-11-03');
  const december2020 = parseYMD('2020-12-03');

  expect(formatYMD(lastDateOfMonth(february2020))).toEqual('2020-02-29');
  expect(formatYMD(lastDateOfMonth(february2019))).toEqual('2019-02-28');
  expect(formatYMD(lastDateOfMonth(january2020))).toEqual('2020-01-31');
  expect(formatYMD(lastDateOfMonth(november2020))).toEqual('2020-11-30');
  expect(formatYMD(lastDateOfMonth(december2020))).toEqual('2020-12-31');
});