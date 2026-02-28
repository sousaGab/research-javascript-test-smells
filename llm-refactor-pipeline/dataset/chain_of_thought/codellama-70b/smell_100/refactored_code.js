describe('datesEqual()', () => {
  it('should return true for identical dates', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
  });

  it('should return false for different dates', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false);
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false);
  });

  it('should ignore time components', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true);
  });
});