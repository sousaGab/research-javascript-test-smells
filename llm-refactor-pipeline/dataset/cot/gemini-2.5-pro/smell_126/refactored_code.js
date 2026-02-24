test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const slightlyUnderTwoHours = { hours: 2, milliseconds: -1 };
  const slightlyOverTwoHours = { hours: 2, milliseconds: 1 };

  const testCases = [
    {
      rounding: "expand",
      expected: ["in 2 hours", "in 2.01 hours", "2 hours ago", "2.01 hours ago"],
    },
    {
      rounding: "trunc",
      expected: ["in 1.99 hours", "in 2 hours", "1.99 hours ago", "2 hours ago"],
    },
    {
      rounding: "round",
      expected: ["in 2 hours", "in 2 hours", "2 hours ago", "2 hours ago"],
    },
    {
      rounding: "floor",
      expected: ["in 1.99 hours", "in 2 hours", "2 hours ago", "2.01 hours ago"],
    },
    {
      rounding: "ceil",
      expected: ["in 2 hours", "in 2.01 hours", "1.99 hours ago", "2 hours ago"],
    },
  ];

  testCases.forEach(({ rounding, expected }) => {
    const opts = { base, round: false, rounding };
    const [
      plusSlightlyUnder,
      plusSlightlyOver,
      minusSlightlyUnder,
      minusSlightlyOver,
    ] = expected;

    expect(base.plus(slightlyUnderTwoHours).toRelative(opts)).toBe(plusSlightlyUnder);
    expect(base.plus(slightlyOverTwoHours).toRelative(opts)).toBe(plusSlightlyOver);
    expect(base.minus(slightlyUnderTwoHours).toRelative(opts)).toBe(minusSlightlyUnder);
    expect(base.minus(slightlyOverTwoHours).toRelative(opts)).toBe(minusSlightlyOver);
  });
});