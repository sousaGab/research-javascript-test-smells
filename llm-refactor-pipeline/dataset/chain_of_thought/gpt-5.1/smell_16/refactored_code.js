it('should compare with custom comparator function', () => {
  const comparator = new Comparator((a, b) => {
    if (a.length === b.length) {
      return 0;
    }

    return a.length < b.length ? -1 : 1;
  });

  const assertComparatorState = (comp, expected) => {
    expect(comp.equal('a', 'b')).toBe(expected.equalAB);
    expect(comp.equal('a', '')).toBe(expected.equalAEmpty);
    expect(comp.lessThan('b', 'aa')).toBe(expected.lessThanBAA);
    expect(comp.greaterThanOrEqual('a', 'aa')).toBe(expected.gteAAA);
    expect(comp.greaterThanOrEqual('aa', 'a')).toBe(expected.gteAAAReverse);
    expect(comp.greaterThanOrEqual('a', 'a')).toBe(expected.gteAA);
  };

  assertComparatorState(comparator, {
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: true,
    gteAAA: false,
    gteAAAReverse: true,
    gteAA: true,
  });

  comparator.reverse();

  assertComparatorState(comparator, {
    equalAB: true,
    equalAEmpty: false,
    lessThanBAA: false,
    gteAAA: true,
    gteAAAReverse: false,
    gteAA: true,
  });
});