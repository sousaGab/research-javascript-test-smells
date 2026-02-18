it("should test clampValue", () => {
    const minValue = 1;
    const maxValue = 10;
    const expectedInRange = 5;
    const expectedBelowMin = 1;
    const expectedAboveMax = 10;
    const expectedStringCoercion = 7;
    const expectedNonNumeric = 1;
    const expectedNaN = 2;

    expect(clampValue(expectedInRange, minValue, maxValue)).toBe(expectedInRange);
    expect(clampValue(0, minValue, maxValue)).toBe(expectedBelowMin);
    expect(clampValue(15, minValue, maxValue)).toBe(expectedAboveMax);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", minValue, maxValue)).toBe(expectedStringCoercion);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", minValue, maxValue)).toBe(expectedNonNumeric);
    expect(clampValue(NaN, expectedNaN, maxValue)).toBe(expectedNaN);
  })