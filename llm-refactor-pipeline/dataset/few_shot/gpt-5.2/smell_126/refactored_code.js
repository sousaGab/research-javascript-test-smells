test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const cases = [
    ["expand", "plus", { hours: 2, milliseconds: -1 }, "in 2 hours"],
    ["expand", "plus", { hours: 2, milliseconds: 1 }, "in 2.01 hours"],
    ["expand", "minus", { hours: 2, milliseconds: -1 }, "2 hours ago"],
    ["expand", "minus", { hours: 2, milliseconds: 1 }, "2.01 hours ago"],

    ["trunc", "plus", { hours: 2, milliseconds: -1 }, "in 1.99 hours"],
    ["trunc", "plus", { hours: 2, milliseconds: 1 }, "in 2 hours"],
    ["trunc", "minus", { hours: 2, milliseconds: -1 }, "1.99 hours ago"],
    ["trunc", "minus", { hours: 2, milliseconds: 1 }, "2 hours ago"],

    ["round", "plus", { hours: 2, milliseconds: -1 }, "in 2 hours"],
    ["round", "plus", { hours: 2, milliseconds: 1 }, "in 2 hours"],
    ["round", "minus", { hours: 2, milliseconds: -1 }, "2 hours ago"],
    ["round", "minus", { hours: 2, milliseconds: 1 }, "2 hours ago"],

    ["floor", "plus", { hours: 2, milliseconds: -1 }, "in 1.99 hours"],
    ["floor", "plus", { hours: 2, milliseconds: 1 }, "in 2 hours"],
    ["floor", "minus", { hours: 2, milliseconds: -1 }, "2 hours ago"],
    ["floor", "minus", { hours: 2, milliseconds: 1 }, "2.01 hours ago"],

    ["ceil", "plus", { hours: 2, milliseconds: -1 }, "in 2 hours"],
    ["ceil", "plus", { hours: 2, milliseconds: 1 }, "in 2.01 hours"],
    ["ceil", "minus", { hours: 2, milliseconds: -1 }, "1.99 hours ago"],
    ["ceil", "minus", { hours: 2, milliseconds: 1 }, "2 hours ago"],
  ];

  for (const [rounding, op, duration, expected] of cases) {
    expect(base[op](duration).toRelative({ base, round: false, rounding })).toBe(expected);
  }
});