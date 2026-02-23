it("should test clampValue", () => {
    const min = 1;
    const max = 10;
    const value = 5;
    expect(clampValue(value, min, max)).toBe(value);

    const value2 = 0;
    expect(clampValue(value2, min, max)).toBe(min);

    const value3 = 15;
    expect(clampValue(value3, min, max)).toBe(max);

    const value4 = "7";
    expect(clampValue(value4, min, max)).toBe(7);

    const value5 = "abc";
    expect(clampValue(value5, min, max)).toBe(min);

    const value6 = NaN;
    expect(clampValue(value6, min, max)).toBe(min);
  })