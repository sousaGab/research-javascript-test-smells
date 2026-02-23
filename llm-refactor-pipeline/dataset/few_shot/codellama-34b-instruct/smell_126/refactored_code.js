test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const roundingModes = ["expand", "trunc", "round", "floor", "ceil"];
  const hours = 2;
  const milliseconds = 1;

  roundingModes.forEach((roundingMode) => {
    const plus = base.plus({ hours, milliseconds });
    const minus = base.minus({ hours, milliseconds });

    expect(plus.toRelative({ base, round: false, rounding: roundingMode })).toBe(`in ${hours}.${milliseconds} hours`);
    expect(minus.toRelative({ base, round: false, rounding: roundingMode })).toBe(`${hours}.${milliseconds} hours ago`);
  });
});