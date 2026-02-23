it('should compare with custom comparator function', () => {
  const comparator = new Comparator((a, b) => {
    if (a.length === b.length) {
      return 0;
    }

    return a.length < b.length ? -1 : 1;
  });

  const runAssertions = (expected) => {
    expect(comparator.equal('a', 'b')).toBe(expected.equalAB);
    expect(comparator.equal('a', '')).toBe(expected.equalAEmpty);
    expect(comparator.lessThan('b', 'aa')).toBe(expected.lessThanBAA);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(expected.greaterThanOrEqualAAA);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(expected.greaterThanOrEqualAAA2);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(expected.greaterThanOrEqualAA);
  };

  runAssertions({
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: true,
    greaterThanOrEqualAAA: false,
    greaterThanOrEqualAAA2: true,
    greaterThanOrEqualAA: true,
  });

  comparator.reverse();

  runAssertions({
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: false,
    greaterThanOrEqualAAA: true,
    greaterThanOrEqualAAA2: false,
    greaterThanOrEqualAA: true,
  });
});