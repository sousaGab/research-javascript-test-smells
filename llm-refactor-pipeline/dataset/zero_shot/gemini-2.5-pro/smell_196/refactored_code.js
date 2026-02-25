describe("clampValue", () => {
  const MIN_CLAMP_VALUE = 1;
  const MAX_CLAMP_VALUE = 10;

  it("should return the value itself when it is within the specified range", () => {
    const valueWithinRange = 5;
    expect(clampValue(valueWithinRange, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(valueWithinRange);
  });

  it("should return the minimum value when the given value is below the range", () => {
    const valueBelowMin = 0;
    expect(clampValue(valueBelowMin, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MIN_CLAMP_VALUE);
  });

  it("should return the maximum value when the given value is above the range", () => {
    const valueAboveMax = 15;
    expect(clampValue(valueAboveMax, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MAX_CLAMP_VALUE);
  });

  describe("when handling non-standard number inputs", () => {
    it("should coerce numeric string inputs", () => {
      const numericString = "7";
      const expectedValue = 7;
      // @ts-ignore
      expect(clampValue(numericString, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(expectedValue);
    });

    it("should fall back to the minimum value for non-numeric string inputs", () => {
      const nonNumericString = "abc";
      // @ts-ignore
      expect(clampValue(nonNumericString, MIN_CLAMP_VALUE, MAX_CLAMP_VALUE)).toBe(MIN_CLAMP_VALUE);
    });

    it("should fall back to the minimum value for NaN inputs", () => {
      const min = 2;
      const max = 5;
      expect(clampValue(NaN, min, max)).toBe(min);
    });
  });
});