test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const baseObject = {
    year: 1982,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  };
  const zone = "America/Los_Angeles";

  const daylight = DateTime.fromObject({ ...baseObject, month: 5 }, { zone });
  expect(daylight).toMatchObject({
    ...baseObject,
    month: 5,
    isOffsetFixed: false,
    offset: -7 * 60,
  });

  const standard = DateTime.fromObject({ ...baseObject, month: 12 }, { zone });
  expect(standard).toMatchObject({
    ...baseObject,
    month: 12,
    isOffsetFixed: false,
    offset: -8 * 60,
  });
});