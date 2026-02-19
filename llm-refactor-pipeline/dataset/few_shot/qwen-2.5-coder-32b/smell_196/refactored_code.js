const MIN_VALUE = 1;
const MAX_VALUE = 10;
const INPUT_WITHIN_RANGE = 5;
const INPUT_BELOW_MIN = 0;
const INPUT_ABOVE_MAX = 15;
const INPUT_STRING_NUMBER = "7";
const INPUT_NON_NUMERIC = "abc";
const INPUT_NAN = NaN;
const EXPECTED_WITHIN_RANGE = 5;
const EXPECTED_BELOW_MIN = 1;
const EXPECTED_ABOVE_MAX = 10;
const EXPECTED_STRING_NUMBER = 7;
const EXPECTED_NON_NUMERIC = 1;
const EXPECTED_NAN = 2;

it("should test clampValue", () => {
  expect(clampValue(INPUT_WITHIN_RANGE, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_WITHIN_RANGE);
  expect(clampValue(INPUT_BELOW_MIN, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_BELOW_MIN);
  expect(clampValue(INPUT_ABOVE_MAX, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_ABOVE_MAX);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(INPUT_STRING_NUMBER, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_STRING_NUMBER);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(INPUT_NON_NUMERIC, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_NON_NUMERIC);
  expect(clampValue(INPUT_NAN, EXPECTED_NAN, MAX_VALUE)).toBe(EXPECTED_NAN);
})