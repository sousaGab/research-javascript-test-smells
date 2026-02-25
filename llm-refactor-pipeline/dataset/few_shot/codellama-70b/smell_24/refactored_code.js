test("Tuesday should be reported as the 2nd day of the week", () => {
    const dt = DateTime.fromISO("2023-08-08", { locale: "de-DE" });
    const EXPECTED_WEEKDAY = 2;
    expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY);
})