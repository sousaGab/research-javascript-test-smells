test("DateTime.local() has today's date", () => {
  const systemNow = new Date();
  const luxonNow = DateTime.local();
  const luxonDate = luxonNow.toJSDate();

  expect(luxonDate.getDate()).toBe(systemNow.getDate());

  const timeDifference = Math.abs(luxonNow.valueOf() - systemNow.valueOf());
  expect(timeDifference).toBeLessThan(1000);
});