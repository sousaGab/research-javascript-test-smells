const CLAMP_MIN = 1;
const CLAMP_MAX = 10;
const VALUE_WITHIN_RANGE = 5;
const VALUE_BELOW_MIN = 0;
const VALUE_ABOVE_MAX = 15;
const STRING_VALUE_WITHIN_RANGE = "7";
const NON_NUMERIC_STRING_VALUE = "abc";
const EXPECTED_CLAMPED_TO_MIN = 1;
const EXPECTED_CLAMPED_TO_MAX = 10;
const EXPECTED_NUMERIC_STRING_RESULT = 7;
const NAN_FALLBACK_MIN = 2;
const NAN_FALLBACK_MAX = 5;

it("should test clampValue", () => {
    expect(clampValue(VALUE_WITHIN_RANGE, CLAMP_MIN, CLAMP_MAX)).toBe(VALUE_WITHIN_RANGE);
    expect(clampValue(VALUE_BELOW_MIN, CLAMP_MIN, CLAMP_MAX)).toBe(EXPECTED_CLAMPED_TO_MIN);
    expect(clampValue(VALUE_ABOVE_MAX, CLAMP_MIN, CLAMP_MAX)).toBe(EXPECTED_CLAMPED_TO_MAX);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue(STRING_VALUE_WITHIN_RANGE, CLAMP_MIN, CLAMP_MAX)).toBe(EXPECTED_NUMERIC_STRING_RESULT);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_STRING_VALUE, CLAMP_MIN, CLAMP_MAX)).toBe(EXPECTED_CLAMPED_TO_MIN);
    expect(clampValue(NaN, NAN_FALLBACK_MIN, NAN_FALLBACK_MAX)).toBe(NAN_FALLBACK_MIN);
});