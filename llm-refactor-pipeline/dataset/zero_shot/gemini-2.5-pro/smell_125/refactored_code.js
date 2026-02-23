test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  const expectedSharedProperties = {
    isOffsetFixed: false,
    year: 1982,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  };

  expect(daylight).toMatchObject({
    ...expectedSharedProperties,
    month: 5,
    offset: -7 * 60,
  });

  expect(standard).toMatchObject({
    ...expectedSharedProperties,
    month: 12,
    offset: -8 * 60,
  });
});