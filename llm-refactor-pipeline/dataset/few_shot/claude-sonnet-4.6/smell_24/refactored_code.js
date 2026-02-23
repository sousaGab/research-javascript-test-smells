const TUESDAY_ISO_DATE = "2023-08-08";
const EXPECTED_WEEKDAY_NUMBER = 2;

test("Tuesday should be reported as the 2nd day of the week", () => {
    const dt = DateTime.fromISO(TUESDAY_ISO_DATE, { locale: "de-DE" });
    expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY_NUMBER);
  })