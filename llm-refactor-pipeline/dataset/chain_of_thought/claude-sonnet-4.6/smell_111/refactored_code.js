describe("weekdays", () => {
  test("returns narrow weekday initials when given 'narrow' format", () => {
    expect(weekdays("narrow")).toStrictEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  test("returns short weekday abbreviations when given 'short' format", () => {
    expect(weekdays("short")).toStrictEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  test("returns full weekday names when given 'long' format", () => {
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

  test("returns numeric weekday values when given 'numeric' format", () => {
    expect(weekdays("numeric")).toStrictEqual(["1", "2", "3", "4", "5", "6", "7"]);
  });

  test("returns null when given null as format", () => {
    expect(weekdays(null)).toStrictEqual(null);
  });
});