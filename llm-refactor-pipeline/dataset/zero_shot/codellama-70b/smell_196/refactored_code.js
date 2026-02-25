it("should test clampValue", () => {
    const min = 1;
    const max = 10;

    expect(clampValue(5, min, max)).toBe(5);
    expect(clampValue(0, min, max)).toBe(min);
    expect(clampValue(15, min, max)).toBe(max);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", min, max)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", min, max)).toBe(min);
    expect(clampValue(NaN, min, max)).toBe(min);
  })