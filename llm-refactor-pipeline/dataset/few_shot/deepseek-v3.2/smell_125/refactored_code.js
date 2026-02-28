test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  expect(daylight).toMatchObject({
    isOffsetFixed: false,
    offset: -7 * 60,
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123
  });

  expect(standard).toMatchObject({
    isOffsetFixed: false,
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