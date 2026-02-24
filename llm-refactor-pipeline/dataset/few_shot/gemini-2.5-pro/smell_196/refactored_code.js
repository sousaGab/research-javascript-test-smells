describe("clampValue", () => {
  const MIN_BOUND = 1;
  const MAX_BOUND = 10;

  it("should return the original value when it is within the specified range", () => {
    const VALUE_IN_RANGE = 5;
    expect(clampValue(VALUE_IN_RANGE, MIN_BOUND, MAX_BOUND)).toBe(VALUE_IN_RANGE);
  });

  it("should return the minimum bound when the value is below the specified range", () => {
    const VALUE_BELOW_RANGE = 0;
    expect(clampValue(VALUE_BELOW_RANGE, MIN_BOUND, MAX_BOUND)).toBe(MIN_BOUND);
  });

  it("should return the maximum bound when the value is above the specified range", () => {
    const VALUE_ABOVE_RANGE = 15;
    expect(clampValue(VALUE_ABOVE_RANGE, MIN_BOUND, MAX_BOUND)).toBe(MAX_BOUND);
  });

  it("should correctly clamp a value provided as a numeric string", () => {
    const NUMERIC_STRING = "7";
    const EXPECTED_VALUE = 7;
    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue(NUMERIC_STRING, MIN_BOUND, MAX_BOUND)).toBe(EXPECTED_VALUE);
  });

  it("should fall back to the minimum bound for non-numeric string inputs", () => {
    const NON_NUMERIC_STRING = "abc";
    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_STRING, MIN_BOUND, MAX_BOUND)).toBe(MIN_BOUND);
  });

  it("should fall back to the minimum bound for NaN inputs", () => {
    const MIN_FOR_NAN_TEST = 2;
    const MAX_FOR_NAN_TEST = 5;
    // non-numeric and NaN fall back to min
    expect(clampValue(NaN, MIN_FOR_NAN_TEST, MAX_FOR_NAN_TEST)).toBe(MIN_FOR_NAN_TEST);
  });
});