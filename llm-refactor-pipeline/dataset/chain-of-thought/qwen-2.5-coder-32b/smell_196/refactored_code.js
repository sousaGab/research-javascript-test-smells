const MIN_VALUE = 1;
const MAX_VALUE = 10;
const EXPECTED_CLAMPED_VALUE = 5;
const LOWER_BOUNDARY_VALUE = 1;
const UPPER_BOUNDARY_VALUE = 10;
const STRING_INPUT_VALUE = 7;
const NON_NUMERIC_FALLBACK_VALUE = 1;
const NAN_FALLBACK_VALUE = 2;

it("should test clampValue", () => {
  expect(clampValue(EXPECTED_CLAMPED_VALUE, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_VALUE);
  expect(clampValue(LOWER_BOUNDARY_VALUE, MIN_VALUE, MAX_VALUE)).toBe(LOWER_BOUNDARY_VALUE);
  expect(clampValue(UPPER_BOUNDARY_VALUE, MIN_VALUE, MAX_VALUE)).toBe(UPPER_BOUNDARY_VALUE);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(String(STRING_INPUT_VALUE), MIN_VALUE, MAX_VALUE)).toBe(STRING_INPUT_VALUE);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue("abc", MIN_VALUE, MAX_VALUE)).toBe(NON_NUMERIC_FALLBACK_VALUE);
  expect(clampValue(NaN, NAN_FALLBACK_VALUE, MAX_VALUE)).toBe(NAN_FALLBACK_VALUE);
});