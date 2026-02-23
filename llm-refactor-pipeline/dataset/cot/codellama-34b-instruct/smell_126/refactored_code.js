// Your COMPLETE refactored test code here
test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const roundingModes = ["expand", "trunc", "round", "floor", "ceil"];
  const durations = [
    { hours: 2, milliseconds: -1 },
    { hours: 2, milliseconds: 1 },
    { hours: -2, milliseconds: -1 },
    { hours: -2, milliseconds: 1 },
  ];

  for (const roundingMode of roundingModes) {
    for (const duration of durations) {
      const expected = getExpected(base, duration, roundingMode);
      const actual = base.plus(duration).toRelative({ base, round: false, rounding: roundingMode });
      expect(actual).toBe(expected);
    }
  }
});

function getExpected(base, duration, roundingMode) {
  const sign = duration.hours < 0 ? "-" : "";
  const hours = Math.abs(duration.hours);
  const milliseconds = Math.abs(duration.milliseconds);

  switch (roundingMode) {
    case "expand":
      return `${sign}${hours}.${milliseconds} hours`;
    case "trunc":
      return `${sign}${hours}.${milliseconds} hours`;
    case "round":
      return `${sign}${hours} hours`;
    case "floor":
      return `${sign}${hours}.${milliseconds} hours`;
    case "ceil":
      return `${sign}${hours}.${milliseconds} hours`;
    default:
      throw new Error(`Invalid rounding mode: ${roundingMode}`);
  }
}