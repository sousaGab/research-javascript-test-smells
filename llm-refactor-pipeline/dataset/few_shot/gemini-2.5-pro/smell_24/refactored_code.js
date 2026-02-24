test("Tuesday should be reported as the 2nd day of the week", () => {
    const A_TUESDAY = "2023-08-08";
    const GERMAN_LOCALE = "de-DE";
    const TUESDAY_AS_SECOND_DAY_OF_WEEK = 2;

    const dt = DateTime.fromISO(A_TUESDAY, { locale: GERMAN_LOCALE });
    expect(dt.localWeekday).toBe(TUESDAY_AS_SECOND_DAY_OF_WEEK);
  })