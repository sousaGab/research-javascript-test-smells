describe('datesEqual()', () => {
  test('returns true for equal dates represented as strings', () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  test('returns false for different dates represented as strings', () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  test('returns false for date object and string representing different dates', () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  test('returns true for date objects with same date but different times', () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  test('returns true for equivalent date string and date object', () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  test('returns false for different date string and date object', () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })
})