const TUESDAY_WEEKDAY_POSITION = 2;
const TUESDAY_DATE_ISO = "2023-08-08";
const GERMAN_LOCALE = "de-DE";

test("Tuesday should be reported as the 2nd day of the week", () => {
  const dt = DateTime.fromISO(TUESDAY_DATE_ISO, { locale: GERMAN_LOCALE });
  expect(dt.localWeekday).toBe(TUESDAY_WEEKDAY_POSITION);
});