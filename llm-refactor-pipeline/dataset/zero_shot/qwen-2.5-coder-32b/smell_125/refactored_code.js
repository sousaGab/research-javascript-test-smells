test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const baseObject = { year: 1982, month: 1, day: 25, hour: 9, minute: 23, second: 54, millisecond: 123 };
  
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  const assertDateTime = (dateTime, expectedOffset, expectedMonth) => {
    expect(dateTime.isOffsetFixed).toBe(false);
    expect(dateTime.offset).toBe(expectedOffset);
    expect(dateTime.year).toBe(1982);
    expect(dateTime.month).toBe(expectedMonth);
    expect(dateTime.day).toBe(25);
    expect(dateTime.hour).toBe(9);
    expect(dateTime.minute).toBe(23);
    expect(dateTime.second).toBe(54);
    expect(dateTime.millisecond).toBe(123);
  };

  assertDateTime(daylight, -7 * 60, 5);
  assertDateTime(standard, -8 * 60, 12);
});