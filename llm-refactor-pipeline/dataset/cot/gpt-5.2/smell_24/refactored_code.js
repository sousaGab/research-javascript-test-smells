const TUESDAY_ISO_DATE = "2023-08-08";
const GERMAN_LOCALE = "de-DE";
const EXPECTED_TUESDAY_LOCAL_WEEKDAY = 2;

test("Tuesday should be reported as the 2nd day of the week", () => {
  const dt = DateTime.fromISO(TUESDAY_ISO_DATE, { locale: GERMAN_LOCALE });
  expect(dt.localWeekday).toBe(EXPECTED_TUESDAY_LOCAL_WEEKDAY);
});