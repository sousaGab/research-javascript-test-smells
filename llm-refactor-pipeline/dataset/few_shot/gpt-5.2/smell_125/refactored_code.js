test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const make = (month) =>
    DateTime.fromObject({ ...baseObject, month }, { zone: "America/Los_Angeles" });

  const expectDateTime = (dt, { offset, month }) => {
    expect(dt.isOffsetFixed).toBe(false);
    expect(dt.offset).toBe(offset);
    expect(dt.year).toBe(1982);
    expect(dt.month).toBe(month);
    expect(dt.day).toBe(25);
    expect(dt.hour).toBe(9);
    expect(dt.minute).toBe(23);
    expect(dt.second).toBe(54);
    expect(dt.millisecond).toBe(123);
  };

  expectDateTime(make(5), { offset: -7 * 60, month: 5 });
  expectDateTime(make(12), { offset: -8 * 60, month: 12 });
});