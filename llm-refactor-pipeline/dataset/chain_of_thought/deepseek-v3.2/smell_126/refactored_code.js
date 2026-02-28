test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const testCases = [
    {
      rounding: "expand",
      expectations: [
        { operation: "plus", offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { operation: "plus", offset: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours" },
        { operation: "minus", offset: { hours: 2, milliseconds: -1 }, expected: "2 hours ago" },
        { operation: "minus", offset: { hours: 2, milliseconds: 1 }, expected: "2.01 hours ago" }
      ]
    },
    {
      rounding: "trunc",
      expectations: [
        { operation: "plus", offset: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours" },
        { operation: "plus", offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { operation: "minus", offset: { hours: 2, milliseconds: -1 }, expected: "1.99 hours ago" },
        { operation: "minus", offset: { hours: 2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    },
    {
      rounding: "round",
      expectations: [
        { operation: "plus", offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { operation: "plus", offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { operation: "minus", offset: { hours: 2, milliseconds: -1 }, expected: "2 hours ago" },
        { operation: "minus", offset: { hours: 2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    },
    {
      rounding: "floor",
      expectations: [
        { operation: "plus", offset: { hours: 2, milliseconds: -1 }, expected: "in 1.99 hours" },
        { operation: "plus", offset: { hours: 2, milliseconds: 1 }, expected: "in 2 hours" },
        { operation: "minus", offset: { hours: 2, milliseconds: -1 }, expected: "2 hours ago" },
        { operation: "minus", offset: { hours: 2, milliseconds: 1 }, expected: "2.01 hours ago" }
      ]
    },
    {
      rounding: "ceil",
      expectations: [
        { operation: "plus", offset: { hours: 2, milliseconds: -1 }, expected: "in 2 hours" },
        { operation: "plus", offset: { hours: 2, milliseconds: 1 }, expected: "in 2.01 hours" },
        { operation: "minus", offset: { hours: 2, milliseconds: -1 }, expected: "1.99 hours ago" },
        { operation: "minus", offset: { hours: 2, milliseconds: 1 }, expected: "2 hours ago" }
      ]
    }
  ];

  testCases.forEach(({ rounding, expectations }) => {
    expectations.forEach(({ operation, offset, expected }) => {
      const dateTime = operation === "plus" ? base.plus(offset) : base.minus(offset);
      expect(dateTime.toRelative({ base, round: false, rounding })).toBe(expected);
    });
  });
});