describe("weekdays", () => {
  test("should return narrow weekdays when format is 'narrow'", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  test("should return short weekdays when format is 'short'", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  test("should return long weekdays when format is 'long'", () => {
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

  test("should return numeric weekdays when format is 'numeric'", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  test("should return null when format is null", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});