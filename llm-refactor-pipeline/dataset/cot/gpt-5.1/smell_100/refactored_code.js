describe('datesEqual()', () => {
  it('returns true when both inputs are the same date string', async () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('returns false when date strings represent different dates', async () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('returns false when a Date object and a date string represent different dates', async () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('returns true when Date objects represent the same calendar date regardless of time', async () => {
    expect(
      datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))
    ).toBe(true)
  })

  it('returns true when a date string and a Date object represent the same date', async () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('returns false when a date string and a Date object represent different dates', async () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})