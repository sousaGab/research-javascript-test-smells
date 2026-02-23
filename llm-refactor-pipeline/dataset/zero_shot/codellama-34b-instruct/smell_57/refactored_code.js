test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(new Date().getDate());
  expect(Math.abs(now.valueOf() - new Date().valueOf()) < 1000).toBe(true);
})