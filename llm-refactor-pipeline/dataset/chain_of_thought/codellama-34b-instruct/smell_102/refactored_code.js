// Your COMPLETE refactored test code here

describe('oneYearAgo() works', () => {
    it('should return the correct date one year ago', () => {
        const date = new Date('2020-02-29');
        const expectedDate = new Date('2019-02-28');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });

    it('should return the correct date one year ago for a non-leap year', () => {
        const date = new Date('2020-02-28');
        const expectedDate = new Date('2019-02-28');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });

    it('should return the correct date one year ago for a leap year', () => {
        const date = new Date('2020-01-31');
        const expectedDate = new Date('2019-01-31');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });

    it('should return the correct date one year ago for a non-leap year', () => {
        const date = new Date('2020-11-01');
        const expectedDate = new Date('2019-11-01');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });

    it('should return the correct date one year ago for a leap year', () => {
        const date = new Date('2020-11-30');
        const expectedDate = new Date('2019-11-30');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });

    it('should return the correct date one year ago for a non-leap year', () => {
        const date = new Date('2020-12-31');
        const expectedDate = new Date('2019-12-31');
        expect(oneYearAgo(date)).toEqual(expectedDate);
    });
});