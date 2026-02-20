test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const testCases = [
    // [input, expected, rounding]
    [{ hours: 2, milliseconds: -1 }, "in 2 hours", "expand"],
    [{ hours: 2, milliseconds: 1 }, "in 2.01 hours", "expand"],
    [{ hours: 2, milliseconds: -1 }, "2 hours ago", "expand"],
    [{ hours: 2, milliseconds: 1 }, "2.01 hours ago", "expand"],

    [{ hours: 2, milliseconds: -1 }, "in 1.99 hours", "trunc"],
    [{ hours: 2, milliseconds: 1 }, "in 2 hours", "trunc"],
    [{ hours: 2, milliseconds: -1 }, "1.99 hours ago", "trunc"],
    [{ hours: 2, milliseconds: 1 }, "2 hours ago", "trunc"],

    [{ hours: 2, milliseconds: -1 }, "in 2 hours", "round"],
    [{ hours: 2, milliseconds: 1 }, "in 2 hours", "round"],
    [{ hours: 2, milliseconds: -1 }, "2 hours ago", "round"],
    [{ hours: 2, milliseconds: 1 }, "2 hours ago", "round"],

    [{ hours: 2, milliseconds: -1 }, "in 1.99 hours", "floor"],
    [{ hours: 2, milliseconds: 1 }, "in 2 hours", "floor"],
    [{ hours: 2, milliseconds: -1 }, "2 hours ago", "floor"],
    [{ hours: 2, milliseconds: 1 }, "2.01 hours ago", "floor"],

    [{ hours: 2, milliseconds: -1 }, "in 2 hours", "ceil"],
    [{ hours: 2, milliseconds: 1 }, "in 2.01 hours", "ceil"],
    [{ hours: 2, milliseconds: -1 }, "1.99 hours ago", "ceil"],
    [{ hours: 2, milliseconds: 1 }, "2 hours ago", "ceil"]
  ];

  for (const [input, expected, rounding] of testCases) {
    expect(base.plus(input).toRelative({ base, round: false, rounding })).toBe(expected);
    expect(base.minus(input).toRelative({ base, round: false, rounding })).toBe(expected);
  }
});