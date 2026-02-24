test("DateTime.local() has today's date", () => {
  const date = new Date();
  const now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  // The two instants should be a few milliseconds apart
  expect(Math.abs(now.valueOf() - date.valueOf())).toBeLessThan(1000);
});