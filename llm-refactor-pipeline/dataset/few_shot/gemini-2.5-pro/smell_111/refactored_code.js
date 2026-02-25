describe("weekdays", () => {
  it("should return narrow weekdays when the format is 'narrow'", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("should return short weekdays when the format is 'short'", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("should return long weekdays when the format is 'long'", () => {
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

  it("should return numeric weekdays when the format is 'numeric'", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should return null when the format is null", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});