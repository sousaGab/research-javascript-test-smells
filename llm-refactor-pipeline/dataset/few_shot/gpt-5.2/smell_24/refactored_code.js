// Your COMPLETE refactored test code here
test("Tuesday should be reported as the 2nd day of the week", () => {
  const TUESDAY_WEEKDAY_NUMBER = 2;

  const dt = DateTime.fromISO("2023-08-08", { locale: "de-DE" });
  expect(dt.localWeekday).toBe(TUESDAY_WEEKDAY_NUMBER);
});