describe("weekdays", () => {
  it('should return an array of single-letter weekday names when the format is "narrow"', () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it('should return an array of short weekday names when the format is "short"', () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it('should return an array of full weekday names when the format is "long"', () => {
    expect(weekdays("long")).toStrictEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]);
  });

  it('should return an array of numeric weekday representations when the format is "numeric"', () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should return null when the format is null", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});