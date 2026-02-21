function testOneYearAgo() {
  const date = new Date();
  const oneYearAgo = date.setFullYear(date.getFullYear() - 1);
  expect(formatYMD(oneYearAgo)).toEqual('2019-02-28');
  expect(formatYMD(oneYearAgo)).toEqual('2019-02-28');
  expect(formatYMD(oneYearAgo)).toEqual('2019-01-31');
  expect(formatYMD(oneYearAgo)).toEqual('2019-11-01');
  expect(formatYMD(oneYearAgo)).toEqual('2019-11-30');
  expect(formatYMD(oneYearAgo)).toEqual('2019-12-31');
}

it('oneYearAgo() works', async () => {
  testOneYearAgo();
});