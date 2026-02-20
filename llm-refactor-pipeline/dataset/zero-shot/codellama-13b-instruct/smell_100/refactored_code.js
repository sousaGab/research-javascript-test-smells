it('datesEqual() works', async () => {
    const date1 = new Date(2020, 0, 15);
    const date2 = new Date(2020, 0, 15, 5, 4, 3);
    const date3 = new Date(2020, 1, 15);

    expect(datesEqual(date1, date1)).toBe(true);
    expect(datesEqual(date1, date2)).toBe(false);
    expect(datesEqual(date1, date3)).toBe(false);
    expect(datesEqual(date2, date1)).toBe(true);
    expect(datesEqual(date2, date3)).toBe(false);
    expect(datesEqual(date3, date1)).toBe(false);
    expect(datesEqual(date3, date2)).toBe(true);
  })