describe('with a custom comparator function', () => {
  let comparator;

  beforeEach(() => {
    comparator = new Comparator((a, b) => {
      if (a.length === b.length) {
        return 0;
      }
      return a.length < b.length ? -1 : 1;
    });
  });

  it('should compare items based on string length', () => {
    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.equal('a', '')).toBe(false);
    expect(comparator.lessThan('b', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(true);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);
  });

  it('should reverse the comparison logic', () => {
    comparator.reverse();

    expect(comparator.equal('a', 'b')).toBe(true);
    expect(comparator.equal('a', '')).toBe(false);
    expect(comparator.lessThan('b', 'aa')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'aa')).toBe(true);
    expect(comparator.greaterThanOrEqual('aa', 'a')).toBe(false);
    expect(comparator.greaterThanOrEqual('a', 'a')).toBe(true);
  });
});