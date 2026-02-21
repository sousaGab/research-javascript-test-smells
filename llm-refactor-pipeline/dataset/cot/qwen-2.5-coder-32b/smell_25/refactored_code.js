const TEST_DATE = "2023-08-06";
const EXPECTED_WEEKDAY = 1;

test("Sunday should be reported as the 1st day of the week", () => {
  const dt = DateTime.fromISO(TEST_DATE, { locale: "en-US" });
  expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY);
});