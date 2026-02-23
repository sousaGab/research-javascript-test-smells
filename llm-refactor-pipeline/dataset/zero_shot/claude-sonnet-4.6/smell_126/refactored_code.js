test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const toRelative = (dt, rounding) => dt.toRelative({ base, round: false, rounding });

  const cases = [
    { rounding: "expand", offset: { hours: 2, milliseconds: -1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "expand", offset: { hours: 2, milliseconds: 1 }, sign: "plus", expected: "in 2.01 hours" },
    { rounding: "expand", offset: { hours: 2, milliseconds: -1 }, sign: "minus", expected: "2 hours ago" },
    { rounding: "expand", offset: { hours: 2, milliseconds: 1 }, sign: "minus", expected: "2.01 hours ago" },

    { rounding: "trunc", offset: { hours: 2, milliseconds: -1 }, sign: "plus", expected: "in 1.99 hours" },
    { rounding: "trunc", offset: { hours: 2, milliseconds: 1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "trunc", offset: { hours: 2, milliseconds: -1 }, sign: "minus", expected: "1.99 hours ago" },
    { rounding: "trunc", offset: { hours: 2, milliseconds: 1 }, sign: "minus", expected: "2 hours ago" },

    { rounding: "round", offset: { hours: 2, milliseconds: -1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "round", offset: { hours: 2, milliseconds: 1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "round", offset: { hours: 2, milliseconds: -1 }, sign: "minus", expected: "2 hours ago" },
    { rounding: "round", offset: { hours: 2, milliseconds: 1 }, sign: "minus", expected: "2 hours ago" },

    { rounding: "floor", offset: { hours: 2, milliseconds: -1 }, sign: "plus", expected: "in 1.99 hours" },
    { rounding: "floor", offset: { hours: 2, milliseconds: 1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "floor", offset: { hours: 2, milliseconds: -1 }, sign: "minus", expected: "2 hours ago" },
    { rounding: "floor", offset: { hours: 2, milliseconds: 1 }, sign: "minus", expected: "2.01 hours ago" },

    { rounding: "ceil", offset: { hours: 2, milliseconds: -1 }, sign: "plus", expected: "in 2 hours" },
    { rounding: "ceil", offset: { hours: 2, milliseconds: 1 }, sign: "plus", expected: "in 2.01 hours" },
    { rounding: "ceil", offset: { hours: 2, milliseconds: -1 }, sign: "minus", expected: "1.99 hours ago" },
    { rounding: "ceil", offset: { hours: 2, milliseconds: 1 }, sign: "minus", expected: "2 hours ago" },
  ];

  for (const { rounding, offset, sign, expected } of cases) {
    const dt = base[sign](offset);
    expect(toRelative(dt, rounding)).toBe(expected);
  }
});