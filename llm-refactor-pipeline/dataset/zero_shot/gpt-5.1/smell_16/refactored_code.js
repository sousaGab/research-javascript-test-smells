it('should compare with custom comparator function', () => {
  const comparator = new Comparator((a, b) => {
    if (a.length === b.length) {
      return 0;
    }

    return a.length < b.length ? -1 : 1;
  });

  const expectations = [
    {
      description: 'normal order',
      setup: (comp) => comp,
      cases: [
        { method: 'equal', args: ['a', 'b'], expected: true },
        { method: 'equal', args: ['a', ''], expected: false },
        { method: 'lessThan', args: ['b', 'aa'], expected: true },
        { method: 'greaterThanOrEqual', args: ['a', 'aa'], expected: false },
        { method: 'greaterThanOrEqual', args: ['aa', 'a'], expected: true },
        { method: 'greaterThanOrEqual', args: ['a', 'a'], expected: true },
      ],
    },
    {
      description: 'reversed order',
      setup: (comp) => {
        comp.reverse();
        return comp;
      },
      cases: [
        { method: 'equal', args: ['a', 'b'], expected: true },
        { method: 'equal', args: ['a', ''], expected: false },
        { method: 'lessThan', args: ['b', 'aa'], expected: false },
        { method: 'greaterThanOrEqual', args: ['a', 'aa'], expected: true },
        { method: 'greaterThanOrEqual', args: ['aa', 'a'], expected: false },
        { method: 'greaterThanOrEqual', args: ['a', 'a'], expected: true },
      ],
    },
  ];

  expectations.forEach(({ setup, cases }) => {
    const configuredComparator = setup(comparator);

    cases.forEach(({ method, args, expected }) => {
      expect(configuredComparator[method](...args)).toBe(expected);
    });
  });
});