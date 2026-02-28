test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const cases = [
    // expand
    { rounding: "expand", op: "plus", ms: -1, expected: "in 2 hours" },
    { rounding: "expand", op: "plus", ms: 1, expected: "in 2.01 hours" },
    { rounding: "expand", op: "minus", ms: -1, expected: "2 hours ago" },
    { rounding: "expand", op: "minus", ms: 1, expected: "2.01 hours ago" },

    // trunc
    { rounding: "trunc", op: "plus", ms: -1, expected: "in 1.99 hours" },
    { rounding: "trunc", op: "plus", ms: 1, expected: "in 2 hours" },
    { rounding: "trunc", op: "minus", ms: -1, expected: "1.99 hours ago" },
    { rounding: "trunc", op: "minus", ms: 1, expected: "2 hours ago" },

    // round
    { rounding: "round", op: "plus", ms: -1, expected: "in 2 hours" },
    { rounding: "round", op: "plus", ms: 1, expected: "in 2 hours" },
    { rounding: "round", op: "minus", ms: -1, expected: "2 hours ago" },
    { rounding: "round", op: "minus", ms: 1, expected: "2 hours ago" },

    // floor
    { rounding: "floor", op: "plus", ms: -1, expected: "in 1.99 hours" },
    { rounding: "floor", op: "plus", ms: 1, expected: "in 2 hours" },
    { rounding: "floor", op: "minus", ms: -1, expected: "2 hours ago" },
    { rounding: "floor", op: "minus", ms: 1, expected: "2.01 hours ago" },

    // ceil
    { rounding: "ceil", op: "plus", ms: -1, expected: "in 2 hours" },
    { rounding: "ceil", op: "plus", ms: 1, expected: "in 2.01 hours" },
    { rounding: "ceil", op: "minus", ms: -1, expected: "1.99 hours ago" },
    { rounding: "ceil", op: "minus", ms: 1, expected: "2 hours ago" },
  ];

  for (const { rounding, op, ms, expected } of cases) {
    const dt = base[op]({ hours: 2, milliseconds: ms });
    expect(dt.toRelative({ base, round: false, rounding })).toBe(expected);
  }
});