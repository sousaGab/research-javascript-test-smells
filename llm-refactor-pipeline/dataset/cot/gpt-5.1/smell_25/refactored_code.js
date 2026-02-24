const SUNDAY_DATE_ISO = "2023-08-06";
const EXPECTED_SUNDAY_LOCAL_WEEKDAY = 1;

test("Sunday should be reported as the 1st day of the week", () => {
  const dt = DateTime.fromISO(SUNDAY_DATE_ISO, { locale: "en-US" });
  expect(dt.localWeekday).toBe(EXPECTED_SUNDAY_LOCAL_WEEKDAY);
});