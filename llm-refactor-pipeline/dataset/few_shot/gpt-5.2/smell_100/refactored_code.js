describe('datesEqual()', () => {
  it('returns true for identical ISO date strings', async () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('returns false for different ISO date strings', async () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('returns false when Date and ISO string represent different dates', async () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('ignores time when comparing Date objects on the same day', async () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('returns true when ISO string and Date represent the same date', async () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('returns false when ISO string and Date represent different dates', async () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})