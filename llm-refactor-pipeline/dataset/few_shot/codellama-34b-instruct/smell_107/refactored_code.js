// Your COMPLETE refactored test code here

describe('lastDateOfMonth()', () => {
    it('returns the last date of the month', () => {
        const date1 = parseYMD('2020-02-03');
        const date2 = parseYMD('2019-02-03');
        const date3 = parseYMD('2020-01-03');
        const date4 = parseYMD('2020-11-03');
        const date5 = parseYMD('2020-12-03');

        expect(formatYMD(lastDateOfMonth(date1))).toEqual('2020-02-29');
        expect(formatYMD(lastDateOfMonth(date2))).toEqual('2019-02-28');
        expect(formatYMD(lastDateOfMonth(date3))).toEqual('2020-01-31');
        expect(formatYMD(lastDateOfMonth(date4))).toEqual('2020-11-30');
        expect(formatYMD(lastDateOfMonth(date5))).toEqual('2020-12-31');
    });
});