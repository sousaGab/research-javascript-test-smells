test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const testCases = [
    // { input, expected, rounding }
    { input: { hours: 2, milliseconds: -1 }, expected: "in 2 hours", rounding: "expand" },
    { input: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours", rounding: "expand" },
    { input: { hours: 2, milliseconds: -1 }, expected: "2 hours ago", rounding: "expand" },
    { input: { hours: 2, milliseconds: 1 }, expected: "2.01 hours ago", rounding: "expand" },

    { input: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours", rounding: "trunc" },
    { input: { hours: 2, milliseconds: 1 }, expected: "in 2 hours", rounding: "trunc" },
    { input: { hours: 2, milliseconds: -1 }, expected: "1.99 hours ago", rounding: "trunc" },
    { input: { hours: 2, milliseconds: 1 }, expected: "2 hours ago", rounding: "trunc" },

    { input: { hours: 2, milliseconds: -1 }, expected: "in 2 hours", rounding: "round" },
    { input: { hours: 2, milliseconds: 1 }, expected: "in 2 hours", rounding: "round" },
    { input: { hours: 2, milliseconds: -1 }, expected: "2 hours ago", rounding: "round" },
    { input: { hours: 2, milliseconds: 1 }, expected: "2 hours ago", rounding: "round" },

    { input: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours", rounding: "floor" },
    { input: { hours: 2, milliseconds: 1 }, expected: "in 2 hours", rounding: "floor" },
    { input: { hours: 2, milliseconds: -1 }, expected: "2 hours ago", rounding: "floor" },
    { input: { hours: 2, milliseconds: 1 }, expected: "2.01 hours ago", rounding: "floor" },

    { input: { hours: 2, milliseconds: -1 }, expected: "in 2 hours", rounding: "ceil" },
    { input: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours", rounding: "ceil" },
    { input: { hours: 2, milliseconds: -1 }, expected: "1.99 hours ago", rounding: "ceil" },
    { input: { hours: 2, milliseconds: 1 }, expected: "2 hours ago", rounding: "ceil" },
  ];

  testCases.forEach(({ input, expected, rounding }) => {
    expect(base.plus(input).toRelative({ base, round: false, rounding })).toBe(expected);
    expect(base.minus(input).toRelative({ base, round: false, rounding })).toBe(expected);
  });
});