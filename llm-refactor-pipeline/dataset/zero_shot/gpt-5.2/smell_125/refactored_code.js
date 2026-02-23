test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const makeDateTime = (month) =>
    DateTime.fromObject({ ...baseObject, month }, { zone: "America/Los_Angeles" });

  const expectDateTimeParts = (dt, { offset, month }) => {
    expect(dt).toEqual(
      expect.objectContaining({
        isOffsetFixed: false,
        offset,
        year: 1982,
        month,
        day: 25,
        hour: 9,
        minute: 23,
        second: 54,
        millisecond: 123,
      })
    );
  };

  const daylight = makeDateTime(5);
  const standard = makeDateTime(12);

  expectDateTimeParts(daylight, { offset: -7 * 60, month: 5 });
  expectDateTimeParts(standard, { offset: -8 * 60, month: 12 });
});