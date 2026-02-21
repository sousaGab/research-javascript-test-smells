it('lastDateOfMonth() works', async () => {
    const date = parseYMD('2020-02-03');
    const lastDate = lastDateOfMonth(date);
    expect(formatYMD(lastDate)).toEqual('2020-02-29');
});

it('lastDateOfMonth() works for non-leap years', async () => {
    const date = parseYMD('2019-02-03');
    const lastDate = lastDateOfMonth(date);
    expect(formatYMD(lastDate)).toEqual('2019-02-28');
});

it('lastDateOfMonth() works for January', async () => {
    const date = parseYMD('2020-01-03');
    const lastDate = lastDateOfMonth(date);
    expect(formatYMD(lastDate)).toEqual('2020-01-31');
});

it('lastDateOfMonth() works for November', async () => {
    const date = parseYMD('2020-11-03');
    const lastDate = lastDateOfMonth(date);
    expect(formatYMD(lastDate)).toEqual('2020-11-30');
});

it('lastDateOfMonth() works for December', async () => {
    const date = parseYMD('2020-12-03');
    const lastDate = lastDateOfMonth(date);
    expect(formatYMD(lastDate)).toEqual('2020-12-31');
});