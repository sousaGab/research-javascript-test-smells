describe("weekdays", () => {
  it("should return weekdays in narrow format", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("should return weekdays in short format", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("should return weekdays in long format", () => {
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

  it("should return weekdays in numeric format", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should return null for null input", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});