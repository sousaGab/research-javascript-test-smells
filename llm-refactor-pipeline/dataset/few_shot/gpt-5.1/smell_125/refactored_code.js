test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  const assertDateTime = (dt, expected) => {
    expect(dt.isOffsetFixed).toBe(false);
    expect(dt.offset).toBe(expected.offset);
    expect(dt.year).toBe(expected.year);
    expect(dt.month).toBe(expected.month);
    expect(dt.day).toBe(expected.day);
    expect(dt.hour).toBe(expected.hour);
    expect(dt.minute).toBe(expected.minute);
    expect(dt.second).toBe(expected.second);
    expect(dt.millisecond).toBe(expected.millisecond);
  };

  assertDateTime(daylight, {
    offset: -7 * 60,
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });

  assertDateTime(standard, {
    offset: -8 * 60,
    year: 1982,
    month: 12,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });
});