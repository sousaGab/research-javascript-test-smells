// Your COMPLETE refactored test code here

describe('oneYearAgo()', () => {
    it('works', () => {
        const testCases = [
            { input: '2020-02-29', expected: '2019-02-28' },
            { input: '2020-02-28', expected: '2019-02-28' },
            { input: '2020-01-31', expected: '2019-01-31' },
            { input: '2020-11-01', expected: '2019-11-01' },
            { input: '2020-11-30', expected: '2019-11-30' },
            { input: '2020-12-31', expected: '2019-12-31' },
        ];

        testCases.forEach(({ input, expected }) => {
            expect(formatYMD(oneYearAgo(parseYMD(input)))).toEqual(expected);
        });
    });
});