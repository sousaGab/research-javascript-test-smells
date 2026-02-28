test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  
  const testCases = [
    // [milliseconds, rounding, expected]
    [2 * 3600 * 1000 - 1, "expand", "in 2 hours"],
    [2 * 3600 * 1000 + 1, "expand", "in 2.01 hours"],
    [-2 * 3600 * 1000 + 1, "expand", "2 hours ago"],
    [-2 * 3600 * 1000 - 1, "expand", "2.01 hours ago"],
    
    [2 * 3600 * 1000 - 1, "trunc", "in 1.99 hours"],
    [2 * 3600 * 1000 + 1, "trunc", "in 2 hours"],
    [-2 * 3600 * 1000 + 1, "trunc", "1.99 hours ago"],
    [-2 * 3600 * 1000 - 1, "trunc", "2 hours ago"],
    
    [2 * 3600 * 1000 - 1, "round", "in 2 hours"],
    [2 * 3600 * 1000 + 1, "round", "in 2 hours"],
    [-2 * 3600 * 1000 + 1, "round", "2 hours ago"],
    [-2 * 3600 * 1000 - 1, "round", "2 hours ago"],
    
    [2 * 3600 * 1000 - 1, "floor", "in 1.99 hours"],
    [2 * 3600 * 1000 + 1, "floor", "in 2 hours"],
    [-2 * 3600 * 1000 + 1, "floor", "2 hours ago"],
    [-2 * 3600 * 1000 - 1, "floor", "2.01 hours ago"],
    
    [2 * 3600 * 1000 - 1, "ceil", "in 2 hours"],
    [2 * 3600 * 1000 + 1, "ceil", "in 2.01 hours"],
    [-2 * 3600 * 1000 + 1, "ceil", "1.99 hours ago"],
    [-2 * 3600 * 1000 - 1, "ceil", "2 hours ago"]
  ];

  testCases.forEach(([ms, rounding, expected]) => {
    expect(base.plus({ milliseconds: ms }).toRelative({ base, round: false, rounding })).toBe(expected);
  });
});