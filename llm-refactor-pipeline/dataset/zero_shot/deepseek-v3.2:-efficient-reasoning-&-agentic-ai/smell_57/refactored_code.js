test("DateTime.local() has today's date", () => {
  const date = new Date();
  const now = DateTime.local();
  
  expect(now.toJSDate().getDate()).toBe(date.getDate());
  expect(Math.abs(now.valueOf() - date.valueOf())).toBeLessThan(1000);
});