test("DateTime.local() has today's date", () => {
  const date = new Date(),
    now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  // The two instants should be a few milliseconds apart
  const diff = Math.abs(now.valueOf() - date.valueOf());
  expect(diff).toBeLessThan(1000);
});