it("should test clampValue", () => {
  const MIN_BOUND = 1;
  const MAX_BOUND = 10;
  const COERCED_STRING_INPUT = "7";
  const NON_NUMERIC_STRING_INPUT = "abc";
  const ALT_MIN_BOUND = 2;
  const ALT_MAX_BOUND = 5;

  const VALUE_WITHIN_RANGE = 5;
  const EXPECTED_WITHIN_RANGE = 5;

  const VALUE_BELOW_MIN = 0;
  const EXPECTED_BELOW_MIN = MIN_BOUND;

  const VALUE_ABOVE_MAX = 15;
  const EXPECTED_ABOVE_MAX = MAX_BOUND;

  const EXPECTED_COERCED_STRING = 7;
  const EXPECTED_NON_NUMERIC_FALLBACK = MIN_BOUND;
  const EXPECTED_NAN_FALLBACK = ALT_MIN_BOUND;

  expect(clampValue(VALUE_WITHIN_RANGE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_WITHIN_RANGE);
  expect(clampValue(VALUE_BELOW_MIN, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_BELOW_MIN);
  expect(clampValue(VALUE_ABOVE_MAX, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_ABOVE_MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(COERCED_STRING_INPUT, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_COERCED_STRING);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(NON_NUMERIC_STRING_INPUT, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_NON_NUMERIC_FALLBACK);
  expect(clampValue(NaN, ALT_MIN_BOUND, ALT_MAX_BOUND)).toBe(EXPECTED_NAN_FALLBACK);
});