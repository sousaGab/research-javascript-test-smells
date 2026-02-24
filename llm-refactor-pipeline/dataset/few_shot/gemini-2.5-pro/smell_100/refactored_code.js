describe('datesEqual', () => {
  it('should return true for two identical date strings', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
  });

  it('should return false for two different date strings', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
  });

  it('should return true for a string and a Date object representing the same date', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true);
  });

  it('should return false for a string and a Date object representing different dates', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false);
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false);
  });

  it('should return true for two Date objects of the same date, ignoring time', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true);
  });
});