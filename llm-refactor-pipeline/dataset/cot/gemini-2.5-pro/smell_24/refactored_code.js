test("Tuesday should be reported as the 2nd day of the week", () => {
    const A_TUESDAY_DATE = "2023-08-08";
    const EXPECTED_WEEKDAY_FOR_TUESDAY = 2;

    const dt = DateTime.fromISO(A_TUESDAY_DATE, { locale: "de-DE" });
    
    expect(dt.localWeekday).toBe(EXPECTED_WEEKDAY_FOR_TUESDAY);
  })