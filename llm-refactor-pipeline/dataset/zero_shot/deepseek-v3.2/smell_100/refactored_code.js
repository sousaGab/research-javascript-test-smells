describe('datesEqual()', () => {
  it('returns true for identical string dates', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('returns false for different string dates', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('returns false when comparing Date object to different string date', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('returns true for Date objects on same day regardless of time', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('returns true when string date matches Date object day', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('returns false when string date differs from Date object day', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})