describe("weekdays", () => {
  it("should return narrow weekdays", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("should return short weekdays", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("should return long weekdays", () => {
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

  it("should return numeric weekdays", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  it("should return null when null is passed", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});