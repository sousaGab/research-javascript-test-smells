// Your COMPLETE refactored test code here
it('lastDateOfMonth() works', async () => {
    const testCases = [
        { input: '2020-02-03', expected: '2020-02-29' },
        { input: '2019-02-03', expected: '2019-02-28' },
        { input: '2020-01-03', expected: '2020-01-31' },
        { input: '2020-11-03', expected: '2020-11-30' },
        { input: '2020-12-03', expected: '2020-12-31' },
    ];

    testCases.forEach(({ input, expected }) => {
        const result = formatYMD(lastDateOfMonth(parseYMD(input)));
        expect(result).toEqual(expected);
    });
});