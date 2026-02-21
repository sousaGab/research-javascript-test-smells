describe('datesEqual()', () => {
  it('should return true when comparing identical dates as strings', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('should return false when comparing different dates as strings', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('should return false when comparing date object with string representing different date', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('should return true when comparing date objects with same date but different times', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('should return true when comparing string date with date object representing same date', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('should return false when comparing string date with date object representing different date', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})