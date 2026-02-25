test("Sunday should be reported as the 1st day of the week", () => {
    const dt = DateTime.fromISO("2023-08-06", { locale: "en-US" });
    const expectedLocalWeekday = 1;
    expect(dt.localWeekday).toBe(expectedLocalWeekday);
  })