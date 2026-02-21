test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  
  const testCases = [
    // { offset, rounding, expected }
    { offset: { hours: 2, milliseconds: -1 }, rounding: "expand", expected: "in 2 hours" },
    { offset: { hours: 2, milliseconds: 1 }, rounding: "expand", expected: "in 2.01 hours" },
    { offset: { hours: -2, milliseconds: -1 }, rounding: "expand", expected: "2 hours ago" },
    { offset: { hours: -2, milliseconds: 1 }, rounding: "expand", expected: "2.01 hours ago" },
    
    { offset: { hours: 2, milliseconds: -1 }, rounding: "trunc", expected: "in 1.99 hours" },
    { offset: { hours: 2, milliseconds: 1 }, rounding: "trunc", expected: "in 2 hours" },
    { offset: { hours: -2, milliseconds: -1 }, rounding: "trunc", expected: "1.99 hours ago" },
    { offset: { hours: -2, milliseconds: 1 }, rounding: "trunc", expected: "2 hours ago" },
    
    { offset: { hours: 2, milliseconds: -1 }, rounding: "round", expected: "in 2 hours" },
    { offset: { hours: 2, milliseconds: 1 }, rounding: "round", expected: "in 2 hours" },
    { offset: { hours: -2, milliseconds: -1 }, rounding: "round", expected: "2 hours ago" },
    { offset: { hours: -2, milliseconds: 1 }, rounding: "round", expected: "2 hours ago" },
    
    { offset: { hours: 2, milliseconds: -1 }, rounding: "floor", expected: "in 1.99 hours" },
    { offset: { hours: 2, milliseconds: 1 }, rounding: "floor", expected: "in 2 hours" },
    { offset: { hours: -2, milliseconds: -1 }, rounding: "floor", expected: "2 hours ago" },
    { offset: { hours: -2, milliseconds: 1 }, rounding: "floor", expected: "2.01 hours ago" },
    
    { offset: { hours: 2, milliseconds: -1 }, rounding: "ceil", expected: "in 2 hours" },
    { offset: { hours: 2, milliseconds: 1 }, rounding: "ceil", expected: "in 2.01 hours" },
    { offset: { hours: -2, milliseconds: -1 }, rounding: "ceil", expected: "1.99 hours ago" },
    { offset: { hours: -2, milliseconds: 1 }, rounding: "ceil", expected: "2 hours ago" }
  ];

  testCases.forEach(({ offset, rounding, expected }) => {
    expect(base.plus(offset).toRelative({ base, round: false, rounding })).toBe(expected);
  });
});