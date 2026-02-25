describe('datesEqual', () => {
  it('should return true for two identical date strings', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
  });

  it('should return false for two different date strings', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
  });

  it('should return false for a Date object and a string representing a different date', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false);
  });

  it('should return true for two Date objects with the same date but different times', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true);
  });

  it('should return true for a date string and a Date object representing the same date', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true);
  });

  it('should return false for a date string and a Date object representing different dates', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false);
  });
});