it("should test clampValue", () => {
  const MIN_BOUND = 1;
  const MAX_BOUND = 10;
  const ALT_MIN_BOUND = 2;
  const ALT_MAX_BOUND = 5;
  const IN_RANGE_VALUE = 5;
  const BELOW_MIN_VALUE = 0;
  const ABOVE_MAX_VALUE = 15;
  const STRING_NUMERIC_VALUE = "7";
  const STRING_NON_NUMERIC_VALUE = "abc";
  const EXPECTED_IN_RANGE = 5;
  const EXPECTED_MIN = 1;
  const EXPECTED_MAX = 10;
  const EXPECTED_STRING_NUMERIC = 7;
  const EXPECTED_ALT_MIN = 2;

  expect(clampValue(IN_RANGE_VALUE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_IN_RANGE);
  expect(clampValue(BELOW_MIN_VALUE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_MIN);
  expect(clampValue(ABOVE_MAX_VALUE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(STRING_NUMERIC_VALUE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_STRING_NUMERIC);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(STRING_NON_NUMERIC_VALUE, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_MIN);
  expect(clampValue(NaN, ALT_MIN_BOUND, ALT_MAX_BOUND)).toBe(EXPECTED_ALT_MIN);
});