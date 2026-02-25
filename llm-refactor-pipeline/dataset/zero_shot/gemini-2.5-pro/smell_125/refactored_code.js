test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const testCases = [
    { description: "daylight time", month: 5, expectedOffset: -7 * 60 },
    { description: "standard time", month: 12, expectedOffset: -8 * 60 },
  ];

  testCases.forEach(({ month, expectedOffset }) => {
    const dt = DateTime.fromObject(
      { ...baseObject, month },
      { zone: "America/Los_Angeles" }
    );

    expect(dt).toMatchObject({
      isOffsetFixed: false,
      offset: expectedOffset,
      year: 1982,
      month: month,
      day: 25,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
    });
  });
});