it("should test clampValue", () => {
    const MIN_CLAMP = 1;
    const MAX_CLAMP = 10;

    const VALUE_WITHIN_RANGE = 5;
    expect(clampValue(VALUE_WITHIN_RANGE, MIN_CLAMP, MAX_CLAMP)).toBe(VALUE_WITHIN_RANGE);

    const VALUE_BELOW_RANGE = 0;
    expect(clampValue(VALUE_BELOW_RANGE, MIN_CLAMP, MAX_CLAMP)).toBe(MIN_CLAMP);

    const VALUE_ABOVE_RANGE = 15;
    expect(clampValue(VALUE_ABOVE_RANGE, MIN_CLAMP, MAX_CLAMP)).toBe(MAX_CLAMP);

    // string inputs are coerced numerically by Math.min/Math.max
    const NUMERIC_STRING_VALUE = "7";
    const EXPECTED_COERCED_VALUE = 7;
    // @ts-ignore
    expect(clampValue(NUMERIC_STRING_VALUE, MIN_CLAMP, MAX_CLAMP)).toBe(EXPECTED_COERCED_VALUE);

    // non-numeric and NaN fall back to min
    const NON_NUMERIC_STRING = "abc";
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_STRING, MIN_CLAMP, MAX_CLAMP)).toBe(MIN_CLAMP);

    const ANOTHER_MIN_CLAMP = 2;
    const ANOTHER_MAX_CLAMP = 5;
    expect(clampValue(NaN, ANOTHER_MIN_CLAMP, ANOTHER_MAX_CLAMP)).toBe(ANOTHER_MIN_CLAMP);
});