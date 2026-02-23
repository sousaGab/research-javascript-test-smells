it("should test clampValue", () => {
  const MIN_BOUND = 1;
  const MAX_BOUND = 10;

  const VALUE_WITHIN_RANGE = 5;
  const EXPECTED_WITHIN_RANGE = 5;

  const VALUE_BELOW_MIN = 0;
  const EXPECTED_CLAMPED_TO_MIN = MIN_BOUND;

  const VALUE_ABOVE_MAX = 15;
  const EXPECTED_CLAMPED_TO_MAX = MAX_BOUND;

  const STRING_NUMERIC_INPUT = "7";
  const EXPECTED_COERCED_NUMERIC = 7;

  const STRING_NON_NUMERIC_INPUT = "abc";
  const EXPECTED_NON_NUMERIC_FALLBACK = MIN_BOUND;

  const NAN_INPUT = NaN;
  const NAN_MIN_BOUND = 2;
  const NAN_MAX_BOUND = 5;
  const EXPECTED_NAN_FALLBACK = NAN_MIN_BOUND;

  expect(clampValue(VALUE_WITHIN_RANGE, MIN_BOUND, MAX_BOUND)).toBe(
    EXPECTED_WITHIN_RANGE
  );
  expect(clampValue(VALUE_BELOW_MIN, MIN_BOUND, MAX_BOUND)).toBe(
    EXPECTED_CLAMPED_TO_MIN
  );
  expect(clampValue(VALUE_ABOVE_MAX, MIN_BOUND, MAX_BOUND)).toBe(
    EXPECTED_CLAMPED_TO_MAX
  );

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(STRING_NUMERIC_INPUT, MIN_BOUND, MAX_BOUND)).toBe(
    EXPECTED_COERCED_NUMERIC
  );

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(STRING_NON_NUMERIC_INPUT, MIN_BOUND, MAX_BOUND)).toBe(
    EXPECTED_NON_NUMERIC_FALLBACK
  );
  expect(clampValue(NAN_INPUT, NAN_MIN_BOUND, NAN_MAX_BOUND)).toBe(
    EXPECTED_NAN_FALLBACK
  );
});