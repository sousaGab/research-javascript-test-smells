test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const testCases = [
    { op: "plus", ms: -1, rounding: "expand", expected: "in 2 hours" },
    { op: "plus", ms: 1, rounding: "expand", expected: "in 2.01 hours" },
    { op: "minus", ms: -1, rounding: "expand", expected: "2 hours ago" },
    { op: "minus", ms: 1, rounding: "expand", expected: "2.01 hours ago" },

    { op: "plus", ms: -1, rounding: "trunc", expected: "in 1.99 hours" },
    { op: "plus", ms: 1, rounding: "trunc", expected: "in 2 hours" },
    { op: "minus", ms: -1, rounding: "trunc", expected: "1.99 hours ago" },
    { op: "minus", ms: 1, rounding: "trunc", expected: "2 hours ago" },

    { op: "plus", ms: -1, rounding: "round", expected: "in 2 hours" },
    { op: "plus", ms: 1, rounding: "round", expected: "in 2 hours" },
    { op: "minus", ms: -1, rounding: "round", expected: "2 hours ago" },
    { op: "minus", ms: 1, rounding: "round", expected: "2 hours ago" },

    { op: "plus", ms: -1, rounding: "floor", expected: "in 1.99 hours" },
    { op: "plus", ms: 1, rounding: "floor", expected: "in 2 hours" },
    { op: "minus", ms: -1, rounding: "floor", expected: "2 hours ago" },
    { op: "minus", ms: 1, rounding: "floor", expected: "2.01 hours ago" },

    { op: "plus", ms: -1, rounding: "ceil", expected: "in 2 hours" },
    { op: "plus", ms: 1, rounding: "ceil", expected: "in 2.01 hours" },
    { op: "minus", ms: -1, rounding: "ceil", expected: "1.99 hours ago" },
    { op: "minus", ms: 1, rounding: "ceil", expected: "2 hours ago" },
  ];

  testCases.forEach(({ op, ms, rounding, expected }) => {
    const duration = { hours: 2, milliseconds: ms };
    const relativeTime = base[op](duration).toRelative({
      base,
      round: false,
      rounding,
    });
    expect(relativeTime).toBe(expected);
  });
});