it("should test clampValue", () => {
    const minValue = 1;
    const maxValue = 10;
    const expectedInRange = 5;
    const expectedAtMin = 1;
    const expectedAtMax = 10;
    const expectedFromString = 7;
    const expectedFromStringInvalid = 1;
    const expectedFromNaN = 2;

    expect(clampValue(expectedInRange, minValue, maxValue)).toBe(expectedInRange);
    expect(clampValue(0, minValue, maxValue)).toBe(expectedAtMin);
    expect(clampValue(15, minValue, maxValue)).toBe(expectedAtMax);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", minValue, maxValue)).toBe(expectedFromString);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", minValue, maxValue)).toBe(expectedFromStringInvalid);
    expect(clampValue(NaN, expectedFromNaN, maxValue)).toBe(expectedFromNaN);
  })