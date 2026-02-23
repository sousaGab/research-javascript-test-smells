test("Sunday should be reported as the 1st day of the week", () => {
    const SUNDAY_ISO = "2023-08-06";
    const FIRST_DAY_OF_WEEK = 1;

    const dt = DateTime.fromISO(SUNDAY_ISO, { locale: "en-US" });
    expect(dt.localWeekday).toBe(FIRST_DAY_OF_WEEK);
  })