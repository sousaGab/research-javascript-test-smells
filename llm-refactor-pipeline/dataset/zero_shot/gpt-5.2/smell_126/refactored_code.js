test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const cases = [
    {
      rounding: "expand",
      expectations: {
        plusMinus1ms: "in 2 hours",
        plusPlus1ms: "in 2.01 hours",
        minusMinus1ms: "2 hours ago",
        minusPlus1ms: "2.01 hours ago",
      },
    },
    {
      rounding: "trunc",
      expectations: {
        plusMinus1ms: "in 1.99 hours",
        plusPlus1ms: "in 2 hours",
        minusMinus1ms: "1.99 hours ago",
        minusPlus1ms: "2 hours ago",
      },
    },
    {
      rounding: "round",
      expectations: {
        plusMinus1ms: "in 2 hours",
        plusPlus1ms: "in 2 hours",
        minusMinus1ms: "2 hours ago",
        minusPlus1ms: "2 hours ago",
      },
    },
    {
      rounding: "floor",
      expectations: {
        plusMinus1ms: "in 1.99 hours",
        plusPlus1ms: "in 2 hours",
        minusMinus1ms: "2 hours ago",
        minusPlus1ms: "2.01 hours ago",
      },
    },
    {
      rounding: "ceil",
      expectations: {
        plusMinus1ms: "in 2 hours",
        plusPlus1ms: "in 2.01 hours",
        minusMinus1ms: "1.99 hours ago",
        minusPlus1ms: "2 hours ago",
      },
    },
  ];

  const scenarios = [
    {
      key: "plusMinus1ms",
      dt: (b) => b.plus({ hours: 2, milliseconds: -1 }),
    },
    {
      key: "plusPlus1ms",
      dt: (b) => b.plus({ hours: 2, milliseconds: 1 }),
    },
    {
      key: "minusMinus1ms",
      dt: (b) => b.minus({ hours: 2, milliseconds: -1 }),
    },
    {
      key: "minusPlus1ms",
      dt: (b) => b.minus({ hours: 2, milliseconds: 1 }),
    },
  ];

  for (const { rounding, expectations } of cases) {
    for (const { key, dt } of scenarios) {
      expect(dt(base).toRelative({ base, round: false, rounding })).toBe(expectations[key]);
    }
  }
});