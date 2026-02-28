// Your COMPLETE refactored test code here

it("should test clampValue", () => {
    const MIN_VALUE = 1;
    const MAX_VALUE = 10;
    const VALID_VALUE = 5;
    const VALID_VALUE_RESULT = 5;
    const MIN_VALUE_RESULT = 1;
    const MAX_VALUE_RESULT = 10;

    expect(clampValue(VALID_VALUE, MIN_VALUE, MAX_VALUE)).toBe(VALID_VALUE_RESULT);
    expect(clampValue(0, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE_RESULT);
    expect(clampValue(15, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE_RESULT);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(NaN, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
})