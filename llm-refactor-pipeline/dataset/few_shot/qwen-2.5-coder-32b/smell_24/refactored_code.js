test("Tuesday should be reported as the 2nd day of the week", () => {
    const TEST_DATE = "2023-08-08";
    const LOCALE = "de-DE";
    const EXPECTED_WEEKDAY = 2;

    const dt = DateTime.fromISO(TEST_DATE, { locale: LOCALE });
    expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY);
});