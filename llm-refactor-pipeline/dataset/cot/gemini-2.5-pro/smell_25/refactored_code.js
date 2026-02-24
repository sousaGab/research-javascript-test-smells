test("Sunday should be reported as the 1st day of the week", () => {
    const SUNDAY_AS_FIRST_DAY_OF_WEEK = 1;
    const A_SUNDAY_IN_ISO_FORMAT = "2023-08-06";
    const dt = DateTime.fromISO(A_SUNDAY_IN_ISO_FORMAT, { locale: "en-US" });
    expect(dt.localWeekday).toBe(SUNDAY_AS_FIRST_DAY_OF_WEEK);
  })