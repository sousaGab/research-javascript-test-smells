describe('datesEqual', () => {
  describe('when dates represent the same day', () => {
    it('should return true for two identical date strings', () => {
      expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
    });

    it('should return true for a date string and a matching Date object', () => {
      expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true);
    });

    it('should return true for two Date objects on the same day, ignoring time differences', () => {
      expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true);
    });
  });

  describe('when dates represent different days', () => {
    it('should return false for two different date strings', () => {
      expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
    });

    it('should return false for a Date object and a non-matching date string', () => {
      expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false);
    });

    it('should return false for a date string and a non-matching Date object', () => {
      expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false);
    });
  });
});