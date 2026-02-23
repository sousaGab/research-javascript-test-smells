describe("weekdays", () => {
  test("returns narrow weekday names when format is 'narrow'", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  test("returns short weekday names when format is 'short'", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  test("returns long weekday names when format is 'long'", () => {
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

  test("returns numeric weekday names when format is 'numeric'", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  test("returns null when format is null", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});