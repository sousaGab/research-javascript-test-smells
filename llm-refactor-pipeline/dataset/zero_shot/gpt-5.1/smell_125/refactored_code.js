test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const zone = "America/Los_Angeles";

  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone }
  );

  const assertDateTime = (dt, { isOffsetFixed, offset, year, month }) => {
    expect(dt.isOffsetFixed).toBe(isOffsetFixed);
    expect(dt.offset).toBe(offset);
    expect(dt.year).toBe(year);
    expect(dt.month).toBe(month);
    expect(dt.day).toBe(25);
    expect(dt.hour).toBe(9);
    expect(dt.minute).toBe(23);
    expect(dt.second).toBe(54);
    expect(dt.millisecond).toBe(123);
  };

  assertDateTime(daylight, {
    isOffsetFixed: false,
    offset: -7 * 60,
    year: 1982,
    month: 5
  });

  assertDateTime(standard, {
    isOffsetFixed: false,
    offset: -8 * 60,
    year: 1982,
    month: 12
  });
});