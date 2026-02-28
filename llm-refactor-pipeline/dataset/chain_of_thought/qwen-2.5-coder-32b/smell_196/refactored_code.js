const TEST_VALUE_5 = 5;
const TEST_VALUE_0 = 0;
const TEST_VALUE_15 = 15;
const TEST_VALUE_7 = 7;
const TEST_VALUE_ABC = "abc";
const TEST_VALUE_NAN = NaN;
const MIN_VALUE = 1;
const MAX_VALUE = 10;
const EXPECTED_CLAMPED_5 = 5;
const EXPECTED_CLAMPED_1 = 1;
const EXPECTED_CLAMPED_10 = 10;
const EXPECTED_CLAMPED_7 = 7;
const EXPECTED_CLAMPED_ABC = 1;
const EXPECTED_CLAMPED_NAN = 2;

it("should test clampValue", () => {
  expect(clampValue(TEST_VALUE_5, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_5);
  expect(clampValue(TEST_VALUE_0, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_1);
  expect(clampValue(TEST_VALUE_15, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_10);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_7);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(TEST_VALUE_ABC, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_CLAMPED_ABC);
  expect(clampValue(TEST_VALUE_NAN, EXPECTED_CLAMPED_NAN, MAX_VALUE)).toBe(EXPECTED_CLAMPED_NAN);
});