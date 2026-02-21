test("DateTime.fromObject() accepts a Zone as the zone option", () => {
  const daylight = DateTime.fromObject(
    { ...baseObject, month: 5 },
    { zone: "America/Los_Angeles" }
  );
  const standard = DateTime.fromObject(
    { ...baseObject, month: 12 },
    { zone: "America/Los_Angeles" }
  );

  expectDateTime(daylight, {
    isOffsetFixed: false,
    offset: -7 * 60,
    year: 1982,
    month: 5,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });

  expectDateTime(standard, {
    isOffsetFixed: false,
    offset: -8 * 60,
    year: 1982,
    month: 12,
    day: 25,
    hour: 9,
    minute: 23,
    second: 54,
    millisecond: 123,
  });
});

function expectDateTime(dateTime, expected) {
  expect(dateTime.isOffsetFixed).toBe(expected.isOffsetFixed);
  expect(dateTime.offset).toBe(expected.offset);
  expect(dateTime.year).toBe(expected.year);
  expect(dateTime.month).toBe(expected.month);
  expect(dateTime.day).toBe(expected.day);
  expect(dateTime.hour).toBe(expected.hour);
  expect(dateTime.minute).toBe(expected.minute);
  expect(dateTime.second).toBe(expected.second);
  expect(dateTime.millisecond).toBe(expected.millisecond);
}