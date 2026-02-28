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

  const assertDateTime = (dt, expected) => {
    expect(dt.isOffsetFixed).toBe(false);
    expect(dt.offset).toBe(expected.offset);
    expect(dt.year).toBe(1982);
    expect(dt.month).toBe(expected.month);
    expect(dt.day).toBe(25);
    expect(dt.hour).toBe(9);
    expect(dt.minute).toBe(23);
    expect(dt.second).toBe(54);
    expect(dt.millisecond).toBe(123);
  };

  assertDateTime(daylight, { offset: -7 * 60, month: 5 });
  assertDateTime(standard, { offset: -8 * 60, month: 12 });
});