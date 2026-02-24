describe('Comparator with custom function', () => {
  const createComparator = () => new Comparator((a, b) => {
    if (a.length === b.length) {
      return 0;
    }
    return a.length < b.length ? -1 : 1;
  });

  it('should handle equality correctly regardless of order', () => {
    const comparator = createComparator();
    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.equal('a', '')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);

    comparator.reverse();
    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);
  });

  it('should handle inequalities with default order', () => {
    const comparator = createComparator();
    expect(comparator.lessThan('b', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(true);
  });

  it('should handle inequalities with reversed order', () => {
    const comparator = createComparator();
    comparator.reverse();
    expect(comparator.lessThan('b', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(false);
  });
});