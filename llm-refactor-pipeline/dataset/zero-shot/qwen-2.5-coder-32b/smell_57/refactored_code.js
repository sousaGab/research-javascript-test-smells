test("DateTime.local() has today's date", () => {
  const date = new Date(),
    now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  // The two instants should be a few milliseconds apart
  expect(now.valueOf()).toBeLessThan(date.valueOf() + 1000);
  expect(now.valueOf()).toBeGreaterThan(date.valueOf() - 1000);
})