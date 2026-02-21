test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  expect(now.toJSDate()).toBeToday();
  expect(now.valueOf()).toBeCloseTo(Date.now(), 1000);
})