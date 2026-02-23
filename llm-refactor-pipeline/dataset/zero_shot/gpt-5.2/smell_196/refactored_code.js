it("should test clampValue", () => {
  const MIN = 1;
  const MAX = 10;

  const IN_RANGE_VALUE = 5;
  const BELOW_MIN_VALUE = 0;
  const ABOVE_MAX_VALUE = 15;

  const STRING_NUMERIC_VALUE = "7";
  const NON_NUMERIC_STRING_VALUE = "abc";

  const ALT_MIN = 2;
  const ALT_MAX = 5;

  expect(clampValue(IN_RANGE_VALUE, MIN, MAX)).toBe(IN_RANGE_VALUE);
  expect(clampValue(BELOW_MIN_VALUE, MIN, MAX)).toBe(MIN);
  expect(clampValue(ABOVE_MAX_VALUE, MIN, MAX)).toBe(MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(STRING_NUMERIC_VALUE, MIN, MAX)).toBe(Number(STRING_NUMERIC_VALUE));

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(NON_NUMERIC_STRING_VALUE, MIN, MAX)).toBe(MIN);
  expect(clampValue(NaN, ALT_MIN, ALT_MAX)).toBe(ALT_MIN);
});