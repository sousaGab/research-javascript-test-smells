test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const cases = [
    // rounding: expand
    {
      rounding: "expand",
      op: "plus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "in 2 hours",
    },
    {
      rounding: "expand",
      op: "plus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "in 2.01 hours",
    },
    {
      rounding: "expand",
      op: "minus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "2 hours ago",
    },
    {
      rounding: "expand",
      op: "minus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "2.01 hours ago",
    },

    // rounding: trunc
    {
      rounding: "trunc",
      op: "plus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "in 1.99 hours",
    },
    {
      rounding: "trunc",
      op: "plus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "in 2 hours",
    },
    {
      rounding: "trunc",
      op: "minus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "1.99 hours ago",
    },
    {
      rounding: "trunc",
      op: "minus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "2 hours ago",
    },

    // rounding: round
    {
      rounding: "round",
      op: "plus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "in 2 hours",
    },
    {
      rounding: "round",
      op: "plus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "in 2 hours",
    },
    {
      rounding: "round",
      op: "minus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "2 hours ago",
    },
    {
      rounding: "round",
      op: "minus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "2 hours ago",
    },

    // rounding: floor
    {
      rounding: "floor",
      op: "plus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "in 1.99 hours",
    },
    {
      rounding: "floor",
      op: "plus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "in 2 hours",
    },
    {
      rounding: "floor",
      op: "minus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "2 hours ago",
    },
    {
      rounding: "floor",
      op: "minus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "2.01 hours ago",
    },

    // rounding: ceil
    {
      rounding: "ceil",
      op: "plus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "in 2 hours",
    },
    {
      rounding: "ceil",
      op: "plus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "in 2.01 hours",
    },
    {
      rounding: "ceil",
      op: "minus",
      delta: { hours: 2, milliseconds: -1 },
      expected: "1.99 hours ago",
    },
    {
      rounding: "ceil",
      op: "minus",
      delta: { hours: 2, milliseconds: 1 },
      expected: "2 hours ago",
    },
  ];

  cases.forEach(({ rounding, op, delta, expected }) => {
    const dt = base[op](delta);
    expect(dt.toRelative({ base, round: false, rounding })).toBe(expected);
  });
});