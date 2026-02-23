// Your COMPLETE refactored test code here
const SUNDAY_ISO_DATE = "2023-08-06";
const US_ENGLISH_LOCALE = "en-US";
const SUNDAY_LOCAL_WEEKDAY_INDEX = 1;

test("Sunday should be reported as the 1st day of the week", () => {
  const dt = DateTime.fromISO(SUNDAY_ISO_DATE, { locale: US_ENGLISH_LOCALE });
  expect(dt.localWeekday).toBe(SUNDAY_LOCAL_WEEKDAY_INDEX);
});