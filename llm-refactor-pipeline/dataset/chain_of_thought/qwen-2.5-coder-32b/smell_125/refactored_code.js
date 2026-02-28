test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const createDateTime = (month, offset) => {
    const dateTime = DateTime.fromObject(
      { ...baseObject, month },
      { zone: "America/Los_Angeles" }
    );
    
    expect(dateTime.isOffsetFixed).toBe(false);
    expect(dateTime.offset).toBe(offset * 60);
    expect(dateTime.year).toBe(1982);
    expect(dateTime.month).toBe(month);
    expect(dateTime.day).toBe(25);
    expect(dateTime.hour).toBe(9);
    expect(dateTime.minute).toBe(23);
    expect(dateTime.second).toBe(54);
    expect(dateTime.millisecond).toBe(123);
    
    return dateTime;
  };

  const daylight = createDateTime(5, -7);
  const standard = createDateTime(12, -8);
});