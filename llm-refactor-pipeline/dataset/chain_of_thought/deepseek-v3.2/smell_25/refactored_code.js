const SUNDAY_DATE = "2023-08-06";
const SUNDAY_WEEKDAY_NUMBER = 1;
const LOCALE = "en-US";

test("Sunday should be reported as the 1st day of the week", () => {
    const dt = DateTime.fromISO(SUNDAY_DATE, { locale: LOCALE });
    expect(dt.localWeekday).toBe(SUNDAY_WEEKDAY_NUMBER);
});