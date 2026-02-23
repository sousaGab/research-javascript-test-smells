const FIRST_DAY_OF_WEEK = 1;

test("Sunday should be reported as the 1st day of the week", () => {
    const dt = DateTime.fromISO("2023-08-06", { locale: "en-US" });
    expect(dt.localWeekday).toBe(FIRST_DAY_OF_WEEK);
  })