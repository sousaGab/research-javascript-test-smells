test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  expect(now.toJSDate()).toBeToday();
  // The two instants should be a few milliseconds apart
  expect(now.valueOf()).toBeCloseTo(Date.now(), 1000);
})