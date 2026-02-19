const SUNDAY_WEEKDAY_NUMBER = 1;
const TEST_DATE = "2023-08-06";

test("Sunday should be reported as the 1st day of the week", () => {
    const dt = DateTime.fromISO(TEST_DATE, { locale: "en-US" });
    expect(dt.localWeekday).toBe(SUNDAY_WEEKDAY_NUMBER);
  })