it("should test clampValue", () => {
    const MIN = 1;
    const MAX = 10;
    const VALUE_WITHIN_RANGE = 5;
    const VALUE_BELOW_MIN = 0;
    const VALUE_ABOVE_MAX = 15;
    const STRING_VALUE_WITHIN_RANGE = "7";
    const NON_NUMERIC_STRING = "abc";
    const NAN_MIN = 2;
    const NAN_MAX = 5;

    expect(clampValue(VALUE_WITHIN_RANGE, MIN, MAX)).toBe(VALUE_WITHIN_RANGE);
    expect(clampValue(VALUE_BELOW_MIN, MIN, MAX)).toBe(MIN);
    expect(clampValue(VALUE_ABOVE_MAX, MIN, MAX)).toBe(MAX);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue(STRING_VALUE_WITHIN_RANGE, MIN, MAX)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_STRING, MIN, MAX)).toBe(MIN);
    expect(clampValue(NaN, NAN_MIN, NAN_MAX)).toBe(NAN_MIN);
  })