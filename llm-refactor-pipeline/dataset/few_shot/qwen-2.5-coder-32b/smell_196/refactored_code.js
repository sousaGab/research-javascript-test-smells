it("should test clampValue", () => {
  const MIN_VALUE = 1;
  const MAX_VALUE = 10;
  const INPUT_WITHIN_RANGE = 5;
  const INPUT_BELOW_MIN = 0;
  const INPUT_ABOVE_MAX = 15;
  const STRING_INPUT = "7";
  const NON_NUMERIC_INPUT = "abc";
  const NAN_INPUT = NaN;
  const EXPECTED_WITHIN_RANGE = 5;
  const EXPECTED_BELOW_MIN = MIN_VALUE;
  const EXPECTED_ABOVE_MAX = MAX_VALUE;
  const EXPECTED_STRING_INPUT = 7;
  const EXPECTED_NON_NUMERIC = MIN_VALUE;
  const EXPECTED_NAN = MIN_VALUE;

  expect(clampValue(INPUT_WITHIN_RANGE, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_WITHIN_RANGE);
  expect(clampValue(INPUT_BELOW_MIN, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_BELOW_MIN);
  expect(clampValue(INPUT_ABOVE_MAX, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_ABOVE_MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(STRING_INPUT, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_STRING_INPUT);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(NON_NUMERIC_INPUT, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_NON_NUMERIC);
  expect(clampValue(NAN_INPUT, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_NAN);
});