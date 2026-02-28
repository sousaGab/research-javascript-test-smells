test("DateTime.local() has today's date", () => {
  const now = DateTime.local();
  const currentDate = new Date();
  
  expect(now.toJSDate().getDate()).toBe(currentDate.getDate());
  expect(now.toJSDate().getMonth()).toBe(currentDate.getMonth());
  expect(now.toJSDate().getFullYear()).toBe(currentDate.getFullYear());
  
  const timeDifference = Math.abs(now.valueOf() - currentDate.valueOf());
  expect(timeDifference).toBeLessThan(1000);
});