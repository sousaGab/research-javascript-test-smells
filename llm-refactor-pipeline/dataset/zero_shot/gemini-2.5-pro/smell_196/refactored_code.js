describe("clampValue", () => {
  const MIN_VALUE = 1;
  const MAX_VALUE = 10;

  it("should return the value itself when it is within the specified range", () => {
    const valueWithinRange = 5;
    expect(clampValue(valueWithinRange, MIN_VALUE, MAX_VALUE)).toBe(valueWithinRange);
  });

  it("should return the minimum value when the given value is below the range", () => {
    const valueBelowMin = 0;
    expect(clampValue(valueBelowMin, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  });

  it("should return the maximum value when the given value is above the range", () => {
    const valueAboveMax = 15;
    expect(clampValue(valueAboveMax, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);
  });

  it("should correctly coerce and clamp numeric string inputs", () => {
    const numericString = "7";
    const expectedCoercedValue = 7;
    // @ts-ignore
    expect(clampValue(numericString, MIN_VALUE, MAX_VALUE)).toBe(expectedCoercedValue);
  });

  describe("when handling non-numeric inputs", () => {
    it("should fall back to the minimum value for a non-numeric string", () => {
      const nonNumericString = "abc";
      // @ts-ignore
      expect(clampValue(nonNumericString, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    });

    it("should fall back to the minimum value for NaN", () => {
      const anotherMin = 2;
      const anotherMax = 5;
      expect(clampValue(NaN, anotherMin, anotherMax)).toBe(anotherMin);
    });
  });
});