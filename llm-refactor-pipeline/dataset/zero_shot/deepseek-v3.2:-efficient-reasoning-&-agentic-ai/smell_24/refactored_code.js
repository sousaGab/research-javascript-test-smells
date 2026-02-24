const TUESDAY_WEEKDAY_NUMBER = 2;
const TEST_DATE = "2023-08-08";
const LOCALE = "de-DE";

test("Tuesday should be reported as the 2nd day of the week", () => {
  const dt = DateTime.fromISO(TEST_DATE, { locale: LOCALE });
  expect(dt.localWeekday).toBe(TUESDAY_WEEKDAY_NUMBER);
});