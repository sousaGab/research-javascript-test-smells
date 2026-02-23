describe('datesEqual()', () => {
  it('returns true when two identical ISO date strings are compared', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('returns false when two different ISO date strings are compared', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('returns false when a Date and a different ISO date string are compared', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('returns true when two Date objects represent the same calendar day even with different times', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('returns true when an ISO date string and a Date object represent the same calendar day', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('returns false when an ISO date string and a Date object represent different calendar days', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})