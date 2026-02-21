test("DateTime#toRelative takes a round and a rounding argument", () => {
  const base = DateTime.fromObject({ year: 1983, month: 10, day: 14 });
  
  const testCases = [
    { 
      input: () => base.plus({ hours: 2, milliseconds: -1 }), 
      rounding: "expand", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: 1 }), 
      rounding: "expand", 
      expected: "in 2.01 hours" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: -1 }), 
      rounding: "expand", 
      expected: "2 hours ago" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: 1 }), 
      rounding: "expand", 
      expected: "2.01 hours ago" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: -1 }), 
      rounding: "trunc", 
      expected: "in 1.99 hours" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: 1 }), 
      rounding: "trunc", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: -1 }), 
      rounding: "trunc", 
      expected: "1.99 hours ago" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: 1 }), 
      rounding: "trunc", 
      expected: "2 hours ago" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: -1 }), 
      rounding: "round", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: 1 }), 
      rounding: "round", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: -1 }), 
      rounding: "round", 
      expected: "2 hours ago" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: 1 }), 
      rounding: "round", 
      expected: "2 hours ago" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: -1 }), 
      rounding: "floor", 
      expected: "in 1.99 hours" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: 1 }), 
      rounding: "floor", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: -1 }), 
      rounding: "floor", 
      expected: "2 hours ago" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: 1 }), 
      rounding: "floor", 
      expected: "2.01 hours ago" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: -1 }), 
      rounding: "ceil", 
      expected: "in 2 hours" 
    },
    { 
      input: () => base.plus({ hours: 2, milliseconds: 1 }), 
      rounding: "ceil", 
      expected: "in 2.01 hours" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: -1 }), 
      rounding: "ceil", 
      expected: "1.99 hours ago" 
    },
    { 
      input: () => base.minus({ hours: 2, milliseconds: 1 }), 
      rounding: "ceil", 
      expected: "2 hours ago" 
    }
  ];

  testCases.forEach(({ input, rounding, expected }) => {
    expect(input().toRelative({ base, round: false, rounding })).toBe(expected);
  });
});