it("should test clampValue", () => {
  const MIN_VALUE = 1;
  const MAX_VALUE = 10;
  const EXPECTED_IN_RANGE = 5;
  const EXPECTED_MIN_CLAMP = 1;
  const EXPECTED_MAX_CLAMP = 10;
  const COERCED_STRING_VALUE = 7;
  const NON_NUMERIC_FALLBACK = 1;
  const NAN_FALLBACK = 2;

  expect(clampValue(EXPECTED_IN_RANGE, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_IN_RANGE);
  expect(clampValue(0, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_MIN_CLAMP);
  expect(clampValue(15, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_MAX_CLAMP);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(COERCED_STRING_VALUE);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue("abc", MIN_VALUE, MAX_VALUE)).toBe(NON_NUMERIC_FALLBACK);
  expect(clampValue(NaN, NAN_FALLBACK, MAX_VALUE)).toBe(NAN_FALLBACK);
});