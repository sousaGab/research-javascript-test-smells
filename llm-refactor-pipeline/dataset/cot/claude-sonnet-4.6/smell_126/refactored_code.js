test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const toRel = (dt, rounding) => dt.toRelative({ base, round: false, rounding });

  const cases = [
    // expand
    ["expand", base.plus({ hours: 2, milliseconds: -1 }), "in 2 hours"],
    ["expand", base.plus({ hours: 2, milliseconds: 1 }), "in 2.01 hours"],
    ["expand", base.minus({ hours: 2, milliseconds: -1 }), "2 hours ago"],
    ["expand", base.minus({ hours: 2, milliseconds: 1 }), "2.01 hours ago"],
    // trunc
    ["trunc", base.plus({ hours: 2, milliseconds: -1 }), "in 1.99 hours"],
    ["trunc", base.plus({ hours: 2, milliseconds: 1 }), "in 2 hours"],
    ["trunc", base.minus({ hours: 2, milliseconds: -1 }), "1.99 hours ago"],
    ["trunc", base.minus({ hours: 2, milliseconds: 1 }), "2 hours ago"],
    // round
    ["round", base.plus({ hours: 2, milliseconds: -1 }), "in 2 hours"],
    ["round", base.plus({ hours: 2, milliseconds: 1 }), "in 2 hours"],
    ["round", base.minus({ hours: 2, milliseconds: -1 }), "2 hours ago"],
    ["round", base.minus({ hours: 2, milliseconds: 1 }), "2 hours ago"],
    // floor
    ["floor", base.plus({ hours: 2, milliseconds: -1 }), "in 1.99 hours"],
    ["floor", base.plus({ hours: 2, milliseconds: 1 }), "in 2 hours"],
    ["floor", base.minus({ hours: 2, milliseconds: -1 }), "2 hours ago"],
    ["floor", base.minus({ hours: 2, milliseconds: 1 }), "2.01 hours ago"],
    // ceil
    ["ceil", base.plus({ hours: 2, milliseconds: -1 }), "in 2 hours"],
    ["ceil", base.plus({ hours: 2, milliseconds: 1 }), "in 2.01 hours"],
    ["ceil", base.minus({ hours: 2, milliseconds: -1 }), "1.99 hours ago"],
    ["ceil", base.minus({ hours: 2, milliseconds: 1 }), "2 hours ago"],
  ];

  for (const [rounding, dt, expected] of cases) {
    expect(toRel(dt, rounding)).toBe(expected);
  }
});