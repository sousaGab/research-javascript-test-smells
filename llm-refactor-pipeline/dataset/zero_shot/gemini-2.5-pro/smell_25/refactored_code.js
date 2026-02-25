test("Sunday should be reported as the 1st day of the week", () => {
    const SUNDAY = 1;
    const aSunday = "2023-08-06";
    const dt = DateTime.fromISO(aSunday, { locale: "en-US" });
    expect(dt.localWeekday).toBe(SUNDAY);
  })