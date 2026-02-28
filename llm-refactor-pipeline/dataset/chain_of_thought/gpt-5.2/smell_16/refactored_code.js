it('should compare with custom comparator function', () => {
  const comparator = new Comparator((a, b) => {
    if (a.length === b.length) {
      return 0;
    }

    return a.length < b.length ? -1 : 1;
  });

  const expectComparatorBehavior = ({
    equalAB,
    equalAEmpty,
    lessThanBAA,
    gteAAA,
    gteAAAReversed,
    gteAA,
  }) => {
    expect(comparator.equal('a', 'b')).toBe(equalAB);
    expect(comparator.equal('a', '')).toBe(equalAEmpty);
    expect(comparator.lessThan('b', 'aa')).toBe(lessThanBAA);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(gteAAA);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(gteAAAReversed);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(gteAA);
  };

  expectComparatorBehavior({
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: true,
    gteAAA: false,
    gteAAAReversed: true,
    gteAA: true,
  });

  comparator.reverse();

  expectComparatorBehavior({
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: false,
    gteAAA: true,
    gteAAAReversed: false,
    gteAA: true,
  });
});