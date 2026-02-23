// Your COMPLETE refactored test code here

it("should test clampValue", () => {
    const MIN_VALUE = 1;
    const MAX_VALUE = 10;
    const VALUE_1 = 5;
    const VALUE_2 = 0;
    const VALUE_3 = 15;
    const STRING_VALUE = "7";
    const NON_NUMERIC_VALUE = "abc";
    const NAN_VALUE = NaN;

    expect(clampValue(VALUE_1, MIN_VALUE, MAX_VALUE)).toBe(VALUE_1);
    expect(clampValue(VALUE_2, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(VALUE_3, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);

    // string inputs are coerced numerically by Math.min/Math.max
    expect(clampValue(STRING_VALUE, MIN_VALUE, MAX_VALUE)).toBe(parseInt(STRING_VALUE));

    // non-numeric and NaN fall back to min
    expect(clampValue(NON_NUMERIC_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(NAN_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
})