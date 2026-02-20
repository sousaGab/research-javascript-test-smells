const INPUT_VALUE_1 = 5;
const INPUT_VALUE_2 = 0;
const INPUT_VALUE_3 = 15;
const INPUT_VALUE_4 = "7";
const INPUT_VALUE_5 = "abc";
const INPUT_VALUE_6 = NaN;
const MIN_VALUE = 1;
const MAX_VALUE = 10;
const EXPECTED_RESULT_1 = 5;
const EXPECTED_RESULT_2 = 1;
const EXPECTED_RESULT_3 = 10;
const EXPECTED_RESULT_4 = 7;
const EXPECTED_RESULT_5 = 1;
const EXPECTED_RESULT_6 = 2;

it("should test clampValue", () => {
  expect(clampValue(INPUT_VALUE_1, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_1);
  expect(clampValue(INPUT_VALUE_2, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_2);
  expect(clampValue(INPUT_VALUE_3, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_3);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(INPUT_VALUE_4, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_4);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(INPUT_VALUE_5, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_5);
  expect(clampValue(INPUT_VALUE_6, MIN_VALUE, MAX_VALUE)).toBe(EXPECTED_RESULT_6);
})