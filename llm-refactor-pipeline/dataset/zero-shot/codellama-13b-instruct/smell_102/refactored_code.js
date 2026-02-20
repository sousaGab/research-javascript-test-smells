it('oneYearAgo() works', async () => {
    const dates = [
        '2020-02-29',
        '2020-02-28',
        '2020-01-31',
        '2020-11-01',
        '2020-11-30',
        '2020-12-31'
    ];

    for (const date of dates) {
        const expected = formatYMD(oneYearAgo(parseYMD(date)));
        expect(formatYMD(oneYearAgo(parseYMD(date)))).toEqual(expected);
    }
});