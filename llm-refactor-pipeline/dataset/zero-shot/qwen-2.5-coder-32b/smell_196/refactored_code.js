it("should test clampValue", () => {
    const minValue = 1;
    const maxValue = 10;
    const expectedInRange = 5;
    const expectedBelowRange = 1;
    const expectedAboveRange = 10;
    const expectedStringCoercion = 7;
    const expectedNonNumeric = 1;
    const expectedNaN = 2;

    expect(clampValue(expectedInRange, minValue, maxValue)).toBe(expectedInRange);
    expect(clampValue(expectedBelowRange - 1, minValue, maxValue)).toBe(expectedBelowRange);
    expect(clampValue(expectedAboveRange + 5, minValue, maxValue)).toBe(expectedAboveRange);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", minValue, maxValue)).toBe(expectedStringCoercion);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", minValue, maxValue)).toBe(expectedNonNumeric);
    expect(clampValue(NaN, expectedNaN, maxValue)).toBe(expectedNaN);
  })