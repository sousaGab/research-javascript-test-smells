test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  
  const testCases = [
    {
      rounding: "expand",
      expectations: [
        { offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { offset: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours" },
        { offset: { hours: -2, milliseconds: -1 }, expected: "2 hours ago" },
        { offset: { hours: -2, milliseconds: 1 }, expected: "2.01 hours ago" }
      ]
    },
    {
      rounding: "trunc",
      expectations: [
        { offset: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours" },
        { offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { offset: { hours: -2, milliseconds: -1 }, expected: "1.99 hours ago" },
        { offset: { hours: -2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    },
    {
      rounding: "round",
      expectations: [
        { offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { offset: { hours: -2, milliseconds: -1 }, expected: "2 hours ago" },
        { offset: { hours: -2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    },
    {
      rounding: "floor",
      expectations: [
        { offset: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours" },
        { offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { offset: { hours: -2, milliseconds: -1 }, expected: "2 hours ago" },
        { offset: { hours: -2, milliseconds: 1 }, expected: "2.01 hours ago" }
      ]
    },
    {
      rounding: "ceil",
      expectations: [
        { offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { offset: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours" },
        { offset: { hours: -2, milliseconds: -1 }, expected: "1.99 hours ago" },
        { offset: { hours: -2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    }
  ];

  testCases.forEach(({ rounding, expectations }) => {
    expectations.forEach(({ offset, expected }) => {
      const dt = offset.hours > 0 
        ? base.plus(offset)
        : base.minus({ hours: -offset.hours, milliseconds: offset.milliseconds });
      
      expect(dt.toRelative({ base, round: false, rounding })).toBe(expected);
    });
  });
});