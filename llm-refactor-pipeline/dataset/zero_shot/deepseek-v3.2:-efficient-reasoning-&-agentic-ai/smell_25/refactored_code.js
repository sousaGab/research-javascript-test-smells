test("Sunday should be reported as the 1st day of the week", () => {
  const SUNDAY_DATE = "2023-08-06";
  const EXPECTED_WEEKDAY_FOR_SUNDAY = 1;
  const dt = DateTime.fromISO(SUNDAY_DATE, { locale: "en-US" });
  expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY_FOR_SUNDAY);
})