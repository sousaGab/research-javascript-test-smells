it("should test clampValue", () => {
  const withinBoundsValue = 5;
  const belowMinValue = 0;
  const aboveMaxValue = 15;
  const coercibleStringValue = "7";
  const nonNumericStringValue = "abc";
  const nanValue = NaN;
  
  const firstMinBound = 1;
  const firstMaxBound = 10;
  const secondMinBound = 2;
  const secondMaxBound = 5;
  
  const expectedWithinBounds = 5;
  const expectedAtMin = 1;
  const expectedAtMax = 10;
  const expectedCoerced = 7;
  const expectedFallbackToMin = 1;
  const expectedNanFallback = 2;

  expect(clampValue(withinBoundsValue, firstMinBound, firstMaxBound)).toBe(expectedWithinBounds);
  expect(clampValue(belowMinValue, firstMinBound, firstMaxBound)).toBe(expectedAtMin);
  expect(clampValue(aboveMaxValue, firstMinBound, firstMaxBound)).toBe(expectedAtMax);

  // string inputs are coerced numerically by Math.min/Math.max
  // @ts-ignore
  expect(clampValue(coercibleStringValue, firstMinBound, firstMaxBound)).toBe(expectedCoerced);

  // non-numeric and NaN fall back to min
  // @ts-ignore
  expect(clampValue(nonNumericStringValue, firstMinBound, firstMaxBound)).toBe(expectedFallbackToMin);
  expect(clampValue(nanValue, secondMinBound, secondMaxBound)).toBe(expectedNanFallback);
})