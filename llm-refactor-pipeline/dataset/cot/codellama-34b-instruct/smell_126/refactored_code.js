test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const roundingModes = ["expand", "trunc", "round", "floor", "ceil"];

  roundingModes.forEach((roundingMode) => {
    const relativeTime = base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: roundingMode });
    expect(relativeTime).toBe(`in 2 hours`);
  });

  roundingModes.forEach((roundingMode) => {
    const relativeTime = base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: roundingMode });
    expect(relativeTime).toBe(`in 2.01 hours`);
  });

  roundingModes.forEach((roundingMode) => {
    const relativeTime = base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: roundingMode });
    expect(relativeTime).toBe(`2 hours ago`);
  });

  roundingModes.forEach((roundingMode) => {
    const relativeTime = base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: roundingMode });
    expect(relativeTime).toBe(`2.01 hours ago`);
  });
});