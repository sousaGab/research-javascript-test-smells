describe('datesEqual()', () => {
  it('returns true when two identical date strings are compared', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('returns false when two different date strings are compared', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('returns false when a Date object and a different date string are compared', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('returns true when two Date objects with the same date but different times are compared', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('returns true when a date string and an equivalent Date object are compared', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('returns false when a date string and a different Date object are compared', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})