test("Tuesday should be reported as the 2nd day of the week", () => {
    const A_TUESDAY_IN_ISO_FORMAT = "2023-08-08";
    const TUESDAY_AS_SECOND_DAY_OF_WEEK = 2;
    const dt = DateTime.fromISO(A_TUESDAY_IN_ISO_FORMAT, { locale: "de-DE" });
    expect(dt.localWeekday).toBe(TUESDAY_AS_SECOND_DAY_OF_WEEK);
  })