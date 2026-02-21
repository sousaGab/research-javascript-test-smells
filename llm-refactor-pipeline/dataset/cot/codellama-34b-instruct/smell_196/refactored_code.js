it("should test clampValue", () => {
    const MIN_VALUE = 1;
    const MAX_VALUE = 10;
    const VALID_VALUE = 5;
    const LOW_VALUE = 0;
    const HIGH_VALUE = 15;
    const STRING_VALUE = "7";
    const NON_NUMERIC_VALUE = "abc";
    const NAN_VALUE = NaN;

    expect(clampValue(VALID_VALUE, MIN_VALUE, MAX_VALUE)).toBe(VALID_VALUE);
    expect(clampValue(LOW_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(HIGH_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MAX_VALUE);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue(STRING_VALUE, MIN_VALUE, MAX_VALUE)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue(NON_NUMERIC_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
    expect(clampValue(NAN_VALUE, MIN_VALUE, MAX_VALUE)).toBe(MIN_VALUE);
  })