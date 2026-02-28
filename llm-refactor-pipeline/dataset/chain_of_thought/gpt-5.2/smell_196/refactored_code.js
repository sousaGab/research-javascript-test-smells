it("should test clampValue", () => {
  const MIN_BOUND = 1;
  const MAX_BOUND = 10;

  const VALUE_WITHIN_RANGE = 5;
  const VALUE_BELOW_MIN = 0;
  const VALUE_ABOVE_MAX = 15;

  const EXPECTED_WITHIN_RANGE = 5;
  const EXPECTED_CLAMPED_TO_MIN = 1;
  const EXPECTED_CLAMPED_TO_MAX = 10;

  expect(clampValue(VALUE_WITHIN_RANGE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_WITHIN_RANGE);
  expect(clampValue(VALUE_BELOW_MIN, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_CLAMPED_TO_MIN);
  expect(clampValue(VALUE_ABOVE_MAX, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_CLAMPED_TO_MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  const STRING_NUMERIC_INPUT = "7";
  const EXPECTED_COERCED_NUMBER = 7;
  // @ts-ignore
  expect(clampValue(STRING_NUMERIC_INPUT, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_COERCED_NUMBER);

  // non-numeric and NaN fall back to min
  const STRING_NON_NUMERIC_INPUT = "abc";
  // @ts-ignore
  expect(clampValue(STRING_NON_NUMERIC_INPUT, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_CLAMPED_TO_MIN);

  const NAN_INPUT = NaN;
  const MIN_BOUND_FOR_NAN = 2;
  const MAX_BOUND_FOR_NAN = 5;
  const EXPECTED_NAN_FALLBACK_TO_MIN = 2;
  expect(clampValue(NAN_INPUT, MIN_BOUND_FOR_NAN, MAX_BOUND_FOR_NAN)).toBe(EXPECTED_NAN_FALLBACK_TO_MIN);
});