describe("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({
    year: 1983,
    month: 10,
    day: 14
  });

  const testCases = [{
    rounding: "expand",
    direction: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "expand",
    direction: "plus",
    ms: 1,
    expected: "in 2.01 hours"
  }, {
    rounding: "expand",
    direction: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "expand",
    direction: "minus",
    ms: 1,
    expected: "2.01 hours ago"
  }, {
    rounding: "trunc",
    direction: "plus",
    ms: -1,
    expected: "in 1.99 hours"
  }, {
    rounding: "trunc",
    direction: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "trunc",
    direction: "minus",
    ms: -1,
    expected: "1.99 hours ago"
  }, {
    rounding: "trunc",
    direction: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, {
    rounding: "round",
    direction: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "round",
    direction: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "round",
    direction: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "round",
    direction: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, {
    rounding: "floor",
    direction: "plus",
    ms: -1,
    expected: "in 1.99 hours"
  }, {
    rounding: "floor",
    direction: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "floor",
    direction: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "floor",
    direction: "minus",
    ms: 1,
    expected: "2.01 hours ago"
  }, {
    rounding: "ceil",
    direction: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "ceil",
    direction: "plus",
    ms: 1,
    expected: "in 2.01 hours"
  }, {
    rounding: "ceil",
    direction: "minus",
    ms: -1,
    expected: "1.99 hours ago"
  }, {
    rounding: "ceil",
    direction: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, ];

  test.each(testCases)(
    "rounding: $rounding | $direction(2h, $ms ms) -> $expected",
    ({
      rounding,
      direction,
      ms,
      expected
    }) => {
      const adjustment = {
        hours: 2,
        milliseconds: ms
      };
      const dt = base[direction](adjustment);
      const relative = dt.toRelative({
        base,
        round: false,
        rounding
      });
      expect(relative).toBe(expected);
    }
  );
});