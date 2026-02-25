describe("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({
    year: 1983,
    month: 10,
    day: 14
  });

  const testCases = [{
    rounding: "expand",
    op: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "expand",
    op: "plus",
    ms: 1,
    expected: "in 2.01 hours"
  }, {
    rounding: "expand",
    op: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "expand",
    op: "minus",
    ms: 1,
    expected: "2.01 hours ago"
  }, {
    rounding: "trunc",
    op: "plus",
    ms: -1,
    expected: "in 1.99 hours"
  }, {
    rounding: "trunc",
    op: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "trunc",
    op: "minus",
    ms: -1,
    expected: "1.99 hours ago"
  }, {
    rounding: "trunc",
    op: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, {
    rounding: "round",
    op: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "round",
    op: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "round",
    op: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "round",
    op: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, {
    rounding: "floor",
    op: "plus",
    ms: -1,
    expected: "in 1.99 hours"
  }, {
    rounding: "floor",
    op: "plus",
    ms: 1,
    expected: "in 2 hours"
  }, {
    rounding: "floor",
    op: "minus",
    ms: -1,
    expected: "2 hours ago"
  }, {
    rounding: "floor",
    op: "minus",
    ms: 1,
    expected: "2.01 hours ago"
  }, {
    rounding: "ceil",
    op: "plus",
    ms: -1,
    expected: "in 2 hours"
  }, {
    rounding: "ceil",
    op: "plus",
    ms: 1,
    expected: "in 2.01 hours"
  }, {
    rounding: "ceil",
    op: "minus",
    ms: -1,
    expected: "1.99 hours ago"
  }, {
    rounding: "ceil",
    op: "minus",
    ms: 1,
    expected: "2 hours ago"
  }, ];

  test.each(testCases)(
    "given { rounding: '$rounding', op: '$op', ms: $ms }, returns '$expected'",
    ({
      rounding,
      op,
      ms,
      expected
    }) => {
      const duration = {
        hours: 2,
        milliseconds: ms
      };
      const relativeTime = base[op](duration).toRelative({
        base,
        round: false,
        rounding
      });
      expect(relativeTime).toBe(expected);
    }
  );
});