it('datesEqual() works with matching dates', async () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
})

it('datesEqual() works with different dates', async () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
})

it('datesEqual() works with date object and string', async () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
})

it('datesEqual() works with date objects with different times', async () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
})

it('datesEqual() works with string and date object', async () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
})

it('datesEqual() works with different months', async () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
})