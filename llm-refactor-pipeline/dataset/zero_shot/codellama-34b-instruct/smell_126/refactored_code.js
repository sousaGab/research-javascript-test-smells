test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });

  test("toRelative with round: false and rounding: 'expand'", () => {
    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "expand" })
    ).toBe("in 2 hours");
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "expand" })
    ).toBe("in 2.01 hours");
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "expand" })
    ).toBe("2 hours ago");
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "expand" })
    ).toBe("2.01 hours ago");
  });

  test("toRelative with round: false and rounding: 'trunc'", () => {
    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "trunc" })
    ).toBe("in 1.99 hours");
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "trunc" })
    ).toBe("in 2 hours");
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "trunc" })
    ).toBe("1.99 hours ago");
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "trunc" })
    ).toBe("2 hours ago");
  });

  test("toRelative with round: false and rounding: 'round'", () => {
    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "round" })
    ).toBe("in 2 hours");
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "round" })
    ).toBe("in 2 hours");
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "round" })
    ).toBe("2 hours ago");
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "round" })
    ).toBe("2 hours ago");
  });

  test("toRelative with round: false and rounding: 'floor'", () => {
    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "floor" })
    ).toBe("in 1.99 hours");
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "floor" })
    ).toBe("in 2 hours");
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "floor" })
    ).toBe("2 hours ago");
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "floor" })
    ).toBe("2.01 hours ago");
  });

  test("toRelative with round: false and rounding: 'ceil'", () => {
    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "ceil" })
    ).toBe("in 2 hours");
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "ceil" })
    ).toBe("in 2.01 hours");
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: "ceil" })
    ).toBe("1.99 hours ago");
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: "ceil" })
    ).toBe("2 hours ago");
  });
});