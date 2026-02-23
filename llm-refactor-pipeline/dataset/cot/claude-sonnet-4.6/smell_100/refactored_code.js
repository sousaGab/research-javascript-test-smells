it('datesEqual() returns true when dates represent the same calendar date', async () => {
    expect(datesEqual('2020-01-15', '2020-01-15')).toBe(true)
  })

  it('datesEqual() returns false when string dates have different months', async () => {
    expect(datesEqual('2020-01-15', '2020-12-15')).toBe(false)
  })

  it('datesEqual() returns false when Date object and string date have different months', async () => {
    expect(datesEqual(new Date(2020, 0, 15), '2020-12-15')).toBe(false)
  })

  it('datesEqual() returns true when two Date objects represent the same calendar date regardless of time', async () => {
    expect(datesEqual(new Date(2020, 0, 15), new Date(2020, 0, 15, 5, 4, 3))).toBe(true)
  })

  it('datesEqual() returns true when a string date and a Date object represent the same calendar date', async () => {
    expect(datesEqual('2020-01-15', new Date(2020, 0, 15))).toBe(true)
  })

  it('datesEqual() returns false when a string date and a Date object have different months', async () => {
    expect(datesEqual('2020-02-15', new Date(2020, 0, 15))).toBe(false)
  })