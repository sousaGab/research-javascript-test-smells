test("DateTime.local() has today's date", () => {
  const date = new Date(),
    now = DateTime.local();
  expect(now.toJSDate()).toEqual(date);
  // The two instants should be a few milliseconds apart
  expect(Math.abs(now.valueOf() - date.valueOf()) < 1000).toBe(true);
})