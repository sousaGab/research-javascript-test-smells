const MIN_VALUE = 1;
const MAX_VALUE = 10;
const EXPECTED_CLAMPED_VALUE = 5;
const LOWER_BOUNDARY_VALUE = 1;
const UPPER_BOUNDARY_VALUE = 10;
const STRING_INPUT_VALUE = 7;
const INVALID_STRING_INPUT = "abc";
const NAN_INPUT = NaN;
const FALLBACK_VALUE = 1;

it("should test clampValue", () => {
  expect(clampValue(5, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_VALUE);
  expect(clampValue(0, MIN_VALUE, MAX_VALUE)).toBe(LOWER_BOUNDARY_VALUE);
  expect(clampValue(15, MIN_VALUE, MAX_VALUE)).toBe(UPPER_BOUNDARY_VALUE);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(STRING_INPUT_VALUE);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(INVALID_STRING_INPUT, MIN_VALUE, MAX_VALUE)).toBe(FALLBACK_VALUE);
  expect(clampValue(NAN_INPUT, 2, 5)).toBe(FALLBACK_VALUE);
});