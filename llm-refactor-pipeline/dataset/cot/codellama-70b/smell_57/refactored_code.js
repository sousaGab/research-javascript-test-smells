test("DateTime.local() has today's date", () => {
  const date = new Date(),
    now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  expect(now.valueOf()).toBeCloseTo(date.valueOf(), 1000);
})