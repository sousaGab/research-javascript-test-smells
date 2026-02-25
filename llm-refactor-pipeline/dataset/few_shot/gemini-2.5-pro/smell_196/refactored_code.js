describe("clampValue", () => {
  const MIN_VALUE = 1;
  const MAX_VALUE = 10;

  it("should return the original value when it is within the range", () => {
    const valueWithinRange = 5;
    expect(clampValue(valueWithinRange, MIN_VALUE, MAX_VALUE)).toBe(valueWithinRange);
  });

  it("should return the minimum value when the original value is below the range", () => {
    const valueBelowRange = 0;
    expect(clampValue(valueBelowRange, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  });

  it("should return the maximum value when the original value is above the range", () => {
    const valueAboveRange = 15;
    expect(clampValue(valueAboveRange, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);
  });

  it("should correctly coerce and clamp a numeric string input", () => {
    const numericString = "7";
    const expectedCoercedValue = 7;
    // @ts-ignore
    expect(clampValue(numericString, MIN_VALUE, MAX_VALUE)).toBe(expectedCoercedValue);
  });

  it("should fall back to the minimum value for a non-numeric string input", () => {
    const nonNumericString = "abc";
    // @ts-ignore
    expect(clampValue(nonNumericString, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  });

  it("should fall back to the minimum value for a NaN input", () => {
    const customMin = 2;
    const customMax = 5;
    expect(clampValue(NaN, customMin, customMax)).toBe(customMin);
  });
});