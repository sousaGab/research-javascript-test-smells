// Your COMPLETE refactored test code here
test("Sunday should be reported as the 1st day of the week", () => {
  const SUNDAY_ISO_DATE = "2023-08-06";
  const US_ENGLISH_LOCALE = "en-US";
  const EXPECTED_SUNDAY_LOCAL_WEEKDAY = 1;

  const dt = DateTime.fromISO(SUNDAY_ISO_DATE, { locale: US_ENGLISH_LOCALE });
  expect(dt.localWeekday).toBe(EXPECTED_SUNDAY_LOCAL_WEEKDAY);
});