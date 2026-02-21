const MIN_VALUE = 1;
const MAX_VALUE = 10;

it("should test clampValue", () => {
    expect(clampValue(5, MIN_VALUE, MAX_VALUE)).toBe(5);
    expect(clampValue(0, MIN_VALUE, MAX_VALUE)).toBe(1);
    expect(clampValue(15, MIN_VALUE, MAX_VALUE)).toBe(10);

    // string inputs are coerced numerically by Math.min/Math.max
    // @ts-ignore
    expect(clampValue("7", MIN_VALUE, MAX_VALUE)).toBe(7);

    // non-numeric and NaN fall back to min
    // @ts-ignore
    expect(clampValue("abc", MIN_VALUE, MAX_VALUE)).toBe(1);
    expect(clampValue(NaN, MIN_VALUE, MAX_VALUE)).toBe(2);
  })