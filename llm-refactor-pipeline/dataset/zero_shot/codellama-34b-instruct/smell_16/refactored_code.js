it('should compare with custom comparator function', () => {
    const comparator = new Comparator((a, b) => {
      if (a.length === b.length) {
        return 0;
      }

      return a.length < b.length ? -1 : 1;
    });

    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.equal('a', '')).toBe(false);
    expect(comparator.lessThan('b', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);

    comparator.reverse();

    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.equal('a', '')).toBe(false);
    expect(comparator.lessThan('b', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);

    function assertComparator(comparator, a, b, expected) {
      expect(comparator.equal(a, b)).toBe(expected);
    }

    assertComparator(comparator, 'a', 'b', true);
    assertComparator(comparator, 'a', '', false);
    assertComparator(comparator, 'b', 'aa', true);
    assertComparator(comparator, 'a', 'aa', false);
    assertComparator(comparator, 'aa', 'a', true);
    assertComparator(comparator, 'a', 'a', true);

    comparator.reverse();

    assertComparator(comparator, 'a', 'b', true);
    assertComparator(comparator, 'a', '', false);
    assertComparator(comparator, 'b', 'aa', false);
    assertComparator(comparator, 'a', 'aa', true);
    assertComparator(comparator, 'aa', 'a', false);
    assertComparator(comparator, 'a', 'a', true);
  })