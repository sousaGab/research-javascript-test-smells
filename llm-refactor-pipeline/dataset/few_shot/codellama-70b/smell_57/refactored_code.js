test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  expect(now.toJSDate().getDate()).toBe(now.toLocal().toJSDate().getDate());
  expect(now.toLocal().toJSDate().getTime()).toBeCloseTo(new Date().getTime(), -3);
})