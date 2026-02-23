// Your COMPLETE refactored test code here

describe('datesEqual()', () => {
    it('should return true for equal dates', () => {
        expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true);
        expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15))).toBe(true);
    });

    it('should return false for unequal dates', () => {
        expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false);
        expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 16))).toBe(false);
    });

    it('should return false for invalid dates', () => {
        expect(datesEqual('2020-01-15', '2020-01-32')).toBe(false);
        expect(datesEqual(new Date(2020, 0, 15), '2020-01-32')).toBe(false);
    });
});