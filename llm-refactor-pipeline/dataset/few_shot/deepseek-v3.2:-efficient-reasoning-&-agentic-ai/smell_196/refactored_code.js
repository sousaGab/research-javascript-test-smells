const VALUE_WITHIN_RANGE = 5;
const VALUE_BELOW_MIN = 0;
const VALUE_ABOVE_MAX = 15;
const MIN_VALUE = 1;
const MAX_VALUE = 10;
const STRING_NUMERIC_VALUE = "7";
const STRING_NON_NUMERIC_VALUE = "abc";
const NAN_VALUE = NaN;
const MIN_VALUE_FOR_NAN_TEST = 2;
const MAX_VALUE_FOR_NAN_TEST = 5;

it("should test clampValue", () => {
  expect(clampValue(VALUE_WITHIN_RANGE, MIN_VALUE, MAX_VALUE)).toBe(VALUE_WITHIN_RANGE);
  expect(clampValue(VALUE_BELOW_MIN, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  expect(clampValue(VALUE_ABOVE_MAX, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(STRING_NUMERIC_VALUE, MIN_VALUE, MAX_VALUE)).toBe(7);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(STRING_NON_NUMERIC_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  expect(clampValue(NAN_VALUE, MIN_VALUE_FOR_NAN_TEST, MAX_VALUE_FOR_NAN_TEST)).toBe(MIN_VALUE_FOR_NAN_TEST);
})