test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const roundingOptions = ["expand", "trunc", "round", "floor", "ceil"];

  roundingOptions.forEach(rounding => {
    const relative = base.toRelative({ base, round: false, rounding });
    expect(relative).toBe(base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding }));
    expect(relative).toBe(base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding }));
    expect(relative).toBe(base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding }));
    expect(relative).toBe(base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding }));
  });
});