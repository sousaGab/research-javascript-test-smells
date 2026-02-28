it("should test clampValue", () => {
    const VALUE_IN_RANGE = 5;
    const VALUE_BELOW_RANGE = 0;
    const VALUE_ABOVE_RANGE = 15;
    const MIN_VALUE = 1;
    const MAX_VALUE = 10;

    expect(clampValue(VALUE_IN_RANGE, MIN_VALUE, MAX_VALUE)).toBe(VALUE_IN_RANGE);
    expect(clampValue(VALUE_BELOW_RANGE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(VALUE_ABOVE_RANGE, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(NaN, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  })