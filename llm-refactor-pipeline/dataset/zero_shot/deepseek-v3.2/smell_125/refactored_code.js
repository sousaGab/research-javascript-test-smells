test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const testCases = [
    {
      month: 5,
      expectedOffset: -7 * 60,
      description: "daylight saving time"
    },
    {
      month: 12,
      expectedOffset: -8 * 60,
      description: "standard time"
    }
  ];

  testCases.forEach(({ month, expectedOffset, description }) => {
    const dt = DateTime.fromObject(
      { ...baseObject, month },
      { zone: "America/Los_Angeles" }
    );

    expect(dt.isOffsetFixed).toBe(false);
    expect(dt.offset).toBe(expectedOffset);
    expect(dt.year).toBe(1982);
    expect(dt.month).toBe(month);
    expect(dt.day).toBe(25);
    expect(dt.hour).toBe(9);
    expect(dt.minute).toBe(23);
    expect(dt.second).toBe(54);
    expect(dt.millisecond).toBe(123);
  });
});