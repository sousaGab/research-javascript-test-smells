describe('datesEqual', () => {
  it('should return true for two identical date strings', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
  });

  it('should return true for a date string and a Date object representing the same day', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true);
  });

  it('should return true for two Date objects representing the same day, ignoring time', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true);
  });

  it('should return false for different dates, regardless of their type', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false);
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false);
  });
});