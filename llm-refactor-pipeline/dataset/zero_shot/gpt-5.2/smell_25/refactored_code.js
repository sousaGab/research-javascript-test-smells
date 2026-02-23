test("Sunday should be reported as the 1st day of the week", () => {
  const SUNDAY_AS_FIRST_DAY_OF_WEEK = 1;

  const dt = DateTime.fromISO("2023-08-06", { locale: "en-US" });

  expect(dt.localWeekday).toBe(SUNDAY_AS_FIRST_DAY_OF_WEEK);
});