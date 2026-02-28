test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  const testCases = [
    // [rounding, plusSlightlyUnder, plusSlightlyOver, minusSlightlyUnder, minusSlightlyOver]
    ["expand", "in 2 hours", "in 2.01 hours", "2 hours ago", "2.01 hours ago"],
    ["trunc", "in 1.99 hours", "in 2 hours", "1.99 hours ago", "2 hours ago"],
    ["round", "in 2 hours", "in 2 hours", "2 hours ago", "2 hours ago"],
    ["floor", "in 1.99 hours", "in 2 hours", "2 hours ago", "2.01 hours ago"],
    ["ceil", "in 2 hours", "in 2.01 hours", "1.99 hours ago", "2 hours ago"],
  ];

  testCases.forEach(([rounding, plusUnder, plusOver, minusUnder, minusOver]) => {
    const options = { base, round: false, rounding };

    expect(base.plus({ hours: 2, milliseconds: -1 }).toRelative(options)).toBe(plusUnder);
    expect(base.plus({ hours: 2, milliseconds: 1 }).toRelative(options)).toBe(plusOver);
    expect(base.minus({ hours: 2, milliseconds: -1 }).toRelative(options)).toBe(minusUnder);
    expect(base.minus({ hours: 2, milliseconds: 1 }).toRelative(options)).toBe(minusOver);
  });
});