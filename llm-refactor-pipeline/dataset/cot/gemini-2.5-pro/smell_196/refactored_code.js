it("should test clampValue", () => {
    const MIN_CLAMP_VALUE = 1;
    const MAX_CLAMP_VALUE = 10;

    const VALUE_WITHIN_RANGE = 5;
    expect(clampValue(VALUE_WITHIN_RANGE, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(VALUE_WITHIN_RANGE);

    const VALUE_BELOW_MIN = 0;
    expect(clampValue(VALUE_BELOW_MIN, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MIN_CLAMP_VALUE);

    const VALUE_ABOVE_MAX = 15;
    expect(clampValue(VALUE_ABOVE_MAX, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MAX_CLAMP_VALUE);

    // string inputs are coerced numerically by Math.min/Math.max
    const NUMERIC_STRING_VALUE = "7";
    const EXPECTED_COERCED_VALUE = 7;
    // @ts-ignore
    expect(clampValue(NUMERIC_STRING_VALUE, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(EXPECTED_COERCED_VALUE);

    // non-numeric and NaN fall back to min
    const NON_NUMERIC_STRING_VALUE = "abc";
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_STRING_VALUE, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MIN_CLAMP_VALUE);

    const ANOTHER_MIN = 2;
    const ANOTHER_MAX = 5;
    expect(clampValue(NaN, ANOTHER_MIN, ANOTHER_MAX)).toBe(ANOTHER_MIN);
});