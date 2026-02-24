const FIRST_DAY_OF_WEEK = 1;
const SUNDAY_DATE_ISO = "2023-08-06";
const US_LOCALE = "en-US";

test("Sunday should be reported as the 1st day of the week", () => {
  const dt = DateTime.fromISO(SUNDAY_DATE_ISO, { locale: US_LOCALE });
  expect(dt.localWeekday).toBe(FIRST_DAY_OF_WEEK);
});