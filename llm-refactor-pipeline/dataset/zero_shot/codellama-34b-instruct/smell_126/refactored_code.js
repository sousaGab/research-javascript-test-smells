test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  const roundingModes = ["expand", "trunc", "round", "floor", "ceil"];
  const roundingModesWithExpectedResults = [
    { roundingMode: "expand", expectedResult: "in 2 hours" },
    { roundingMode: "trunc", expectedResult: "in 1.99 hours" },
    { roundingMode: "round", expectedResult: "in 2 hours" },
    { roundingMode: "floor", expectedResult: "in 1.99 hours" },
    { roundingMode: "ceil", expectedResult: "in 2 hours" },
  ];

  roundingModes.forEach((roundingMode) => {
    const expectedResult = roundingModesWithExpectedResults.find(
      (roundingModeWithExpectedResult) => roundingModeWithExpectedResult.roundingMode === roundingMode
    ).expectedResult;

    expect(
      base.plus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: roundingMode })
    ).toBe(expectedResult);
    expect(
      base.plus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: roundingMode })
    ).toBe(expectedResult);
    expect(
      base.minus({ hours: 2, milliseconds: -1 }).toRelative({ base, round: false, rounding: roundingMode })
    ).toBe(expectedResult);
    expect(
      base.minus({ hours: 2, milliseconds: 1 }).toRelative({ base, round: false, rounding: roundingMode })
    ).toBe(expectedResult);
  });
});